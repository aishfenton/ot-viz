OT.pages.main = function(_export) {
  
  var $container,
      posTrack = [100000, 10000],
      globe; 

  function loadRes() {
    $.get('/res.json', function(data) {
      data.forEach(function(d) { globe.addPoint(d.lng, d.lat, d.no_of_res); });
    });
  }

  function onWindowResize( event ) {
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  $(function() {
    $container = $('#container');

    globe = OT.components.globe($container);
    window.globe = globe;
    
    loadRes();
    setInterval(function() { loadRes(); }, 3000);
   
    setInterval(function() {
      height = [1, 2, 3].sample(); 
      
      new TWEEN.Tween({h: globe.cameraHeight()})
          .to({h: height}, 4000)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onUpdate(function(d) { globe.cameraHeight(this.h); })
          .start();

    }, 11000);

    setInterval(function() {
      distance = (Math.random() * 2) + 1.5
      
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


