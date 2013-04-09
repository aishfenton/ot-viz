OT.pages.main = function(_export) {
  
  var createRingBuffer = function(length) {
    var pointer = 0, buffer = []; 

    return {
      pop: function() {
        var e = buffer[0];
        buffer = buffer.slice(1, buffer.length); 
        return e; 
      },
      
      push: function(item) {
        buffer[pointer] = item;
        pointer = (length + pointer +1) % length;
      }
    };
  };
  
  var $container,
      posTrack = [100000, 10000],
      globe,
      reses = OT.streamList('resid'),
      queue = createRingBuffer(30);
      points = {};

  function geoHash(latitude, longitude) {
    var BITS = [16, 8, 4, 2, 1];
    var BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
    var is_even=1;
    var i=0;
    var lat = []; var lon = [];
    var bit=0;
    var ch=0;
    var precision = 12;
    geohash = "";

    lat[0] = -90.0;  lat[1] = 90.0;
    lon[0] = -180.0; lon[1] = 180.0;

    while (geohash.length < precision) {
      if (is_even) {
        mid = (lon[0] + lon[1]) / 2;
        if (longitude > mid) {
          ch |= BITS[bit];
          lon[0] = mid;
        } else
          lon[1] = mid;
      } else {
        mid = (lat[0] + lat[1]) / 2;
        if (latitude > mid) {
          ch |= BITS[bit];
          lat[0] = mid;
        } else
          lat[1] = mid;
      }

      is_even = !is_even;
      if (bit < 4)
        bit++;
      else {
        geohash += BASE32[ch];
        bit = 0;
        ch = 0;
      }
    }
    return geohash;
  }

  function clusterData(data) {
    var clusters = {}
    data.forEach(function(d) {
      gridId = geoHash(d.latitude, d.longitude).substring(0,4);
      if (clusters[gridId]) {
        clusters[gridId].magnitude += 1; 
      } else {
        clusters[gridId] = { gridId: gridId, lat: d.latitude, lng: d.longitude, magnitude: 1 };
      }
    });
    return Object.values(clusters);
  } 

  function processQueue() {
    $('#ticker div').first().remove();
    e = queue.pop();
    if (!e)
      return;

    $('#ticker').append("<div id=" + e.resid + "><span>" + e.partysize + "</span> for " + e.restaurantname + "</div>"); 
  }

  function loadRes(region) {
    $.get('/res/' + region + '.json', function(data) {
      reses.process(data.reservations)
        .enter(function(d) {
          queue.push(d);
        })

      var pointUpdates = clusterData(reses.entered());
      pointUpdates.forEach(function(d) { 
        if (d.gridId in points) {
          points[d.gridId].magnitude += d.magnitude;
        } else {
          points[d.gridId] = d;
        }
      });
  
      updateGlobe(points);
 
    });
  }

  function updateGlobe(points) {
    var pointArray = Object.values(points);
    var maxMag = pointArray.max('magnitude').magnitude;
    pointArray.forEach(function(d) { 
      if (globe.getPoint(d.gridId)) {
        globe.updatePoint(d.gridId, d.magnitude / maxMag);
      } else {
        globe.addPoint(d.gridId, d.lng, d.lat, d.magnitude / maxMag); 
      }
    });    
  }

  function onWindowResize( event ) {
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  $(function() {
    $container = $('#container');

    globe = OT.components.globe($container);
    window.globe = globe;
    
    loadRes('na');
    loadRes('eu');
    loadRes('ap');

    setInterval(function() { loadRes('na'); }, 30000);
    setInterval(function() { loadRes('eu'); }, 31000);
    setInterval(function() { loadRes('ap'); }, 32000);
   
    setInterval(function() { processQueue(); }, 2000);
    
    setInterval(function() {
      height = [1, 2, 3].sample(); 
      
      new TWEEN.Tween({h: globe.cameraHeight()})
          .to({h: height}, 4000)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onUpdate(function(d) { globe.cameraHeight(this.h); })
          .start();

    }, 11000);

    setInterval(function() {
      distance = (Math.random() * 1.5) + 2
      
      new TWEEN.Tween({dist: globe.zoom()})
          .to({dist: distance}, 4000)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onUpdate(function(d) { globe.zoom(this.dist); })
          .start();

    }, 15000);

    animate();
    
  });
  
  function animate() {
    requestAnimationFrame( animate );
    TWEEN.update();
  }
  
};


