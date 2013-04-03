OT.components.globe = function(container) {

  var globe = {},
      $container = container;

  var startTime;

  var camera, scene, renderer;
  var uniforms, mesh, meshes = [];

  var mouseX = 0, mouseY = 0,
      lat = 0, lon = 0, phy = 0, theta = 0;

  var points = {},
      pointSize = 0.005,
      pointLength = 0.5;

  var halfX = $container.width() / 2,
      halfY = $container.height() / 2;

  var phi = 0, theta = 0, radius = 1;
    
  var distance = 3,
      cameraHeight = 1;

  function colorFn(x) {
    var c = new THREE.Color();
    c.setHSV( ( 0.6 - ( x * 0.5 ) ), 1.0, 1.0 );
    return c;
  };
  
  function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 40, halfX / halfY, 1, 3000 );
    camera.position.z = distance;
    camera.position.y = cameraHeight;

    scene.add( camera );

    startTime = Date.now();

    uniforms = {
      sunDirection: { type: "v3", value: new THREE.Vector3(-1, 0.5, 0) },
      dayTexture: { type: "t", value: 0, texture: THREE.ImageUtils.loadTexture( "/img/earth-day-large.jpg" ) },
      nightTexture: { type: "t", value: 1, texture: THREE.ImageUtils.loadTexture( "/img/earth-night-large.jpg" ) }
    };
    
    uniforms.dayTexture.texture.wrapS = uniforms.dayTexture.texture.wrapT = THREE.Repeat;
    uniforms.nightTexture.texture.wrapS = uniforms.nightTexture.texture.wrapT = THREE.Repeat;
 
    material = new THREE.ShaderMaterial({
      wireframe: false,
      uniforms: uniforms,
      vertexShader: document.getElementById( 'vertexShader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentShader' ).textContent
    });

    mesh = new THREE.Mesh( new THREE.SphereGeometry( radius, 64, 32 ), material );
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer();
    $container.append(renderer.domElement);

    resize();
  }

  function animate() {
    requestAnimationFrame( animate ); 
    render();
  }
  
  function setMagnitude(mesh, magnitude) {
    if (magnitude <= 0)
      throw "magnitude must be > 0";

    mesh.morphTargetInfluences[0] = magnitude;

    for (var i = 0; i < mesh.geometry.faces.length; i++) {
      mesh.geometry.faces[i].color = colorFn(magnitude);
    }
    mesh.geometry.colorsNeedUpdate = true;        
  }

  function buildPoint(phi, theta, magnitude) {
    //var length =  magnitude * pointLength;
    var geo = new THREE.CubeGeometry(pointSize, 0.01, pointSize);
    geo.applyMatrix( new THREE.Matrix4().translate(new THREE.Vector3(0, 0.01/2, 0)));    
    
    // XXX Rotating mesh instead, but means I can't combine all geometries into one mesh!
    //geo.applyMatrix( new THREE.Matrix4().rotateZ( - theta )); 
    //geo.applyMatrix( new THREE.Matrix4().rotateY( - phi ));    
  
    vertices = [];  
    for ( var v = 0; v < geo.vertices.length; v++ ) {
      vertices.push( geo.vertices[v].clone() );
    }
    vertices[0].y += pointLength;
    vertices[1].y += pointLength;
    vertices[4].y += pointLength;
    vertices[5].y += pointLength;
    geo.morphTargets.push( { name: "full-length", vertices: vertices }); 

    var mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors, morphTargets: true }) );
    mesh.rotation.z = -theta;
    mesh.rotation.y = -phi;
    
    setMagnitude(mesh, magnitude);
  
    var v = PTToVertex(phi, theta, radius);
    mesh.position.x = v.x;
    mesh.position.y = v.y;
    mesh.position.z = v.z;

    scene.add(mesh);
    return mesh;
  }

  function addPoint(id, lng, lat, magnitude) {
    var coord = lngLatToPT(lng, lat);
    mesh = buildPoint(coord[0], coord[1], magnitude);
    points[id] = mesh;
  }

  function removePoint(id) {
    var mesh = points[id]; 
    scene.remove(mesh);
  }

  function getPoint(id) {
    points[id];
  }
  
  function updatePoint(id, magnitude) {
    var mesh = points[id];
    setMagnitude(mesh, magnitude);
  }
  
  function lngLatToPT(lng, lat) {
    var phi = -lng * Math.PI / 180; 
    var theta = (90 - lat) * Math.PI / 180;
    return [phi, theta];
  }
  
  function PTToVertex(phi, theta, radius) {
    var v = new THREE.Vector3(0, 0, 0);
    v.x = Math.sin(theta) * Math.cos(phi) * radius;
    v.y = Math.cos(theta);
    v.z = Math.sin(theta) * Math.sin(phi) * radius;
    return v;
  }
  window.PTToVertex = PTToVertex;

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);    
  }

  function zoom(d) {
    distance = d;
  }

  function render() {
    phi -= 0.01
    camera.position.x = Math.sin(phi) * Math.cos(theta) * distance
    camera.position.y = Math.sin(theta) * distance + cameraHeight;
    camera.position.z = Math.cos(phi) * Math.cos(theta) * distance
    
    camera.lookAt(new THREE.Vector3(0,0,0));
  
    //uniforms.sunDirection.value.x = Math.sin(-phi) * Math.cos(theta) * distance;
    //uniforms.sunDirection.value.y = Math.sin(theta) * distance + cameraHeight;
    //uniforms.sunDirection.value.z = Math.cos(-phi) * Math.cos(theta) * distance;
 
    renderer.render( scene, camera );
  }
 
  init();
  animate();

  globe.addPoint = addPoint;
  globe.removePoint = removePoint;
  globe.updatePoint = updatePoint;
  globe.getPoint = getPoint;

  globe.zoom = function(_) {
    if (!arguments.length) return distance;
    zoom(_);
    return globe;
  };

  globe.cameraHeight = function(_) {
    if (!arguments.length) return cameraHeight;
    cameraHeight = _;
    return globe;
  };

  return globe;
}
