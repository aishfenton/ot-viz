OT.components.globe = function(container) {

  var globe = {},
      $container = container;

  var startTime;

  var camera, scene, renderer;
  var uniforms, mesh, meshes = [];

  var mouseX = 0, mouseY = 0,
      lat = 0, lon = 0, phy = 0, theta = 0;

  var pointSize = 0.005,
      pointLength = 0.5;

  var halfX = $container.width() / 2,
      halfY = $container.height() / 2;

  var phi = 0, theta = 0, radius = 1;
    
  var distance = 4,
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

    directionalLight = new THREE.DirectionalLight( 0xaaff33, 0 );
    directionalLight.position.set( 1, 0, 0 ).normalize();
    //scene.add( directionalLight );

    startTime = Date.now();

    uniforms = {
      sunDirection: { type: "v3", value: new THREE.Vector3(1, 0.5, 0) },
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

    mesh = new THREE.Mesh( new THREE.SphereGeometry( radius, 32, 16 ), material );
    scene.add(mesh);

    //meshes.push(mesh);

    renderer = new THREE.WebGLRenderer();
    $container.append(renderer.domElement);

    resize();
  }

  function animate() {
    requestAnimationFrame( animate );
    render();
  }

  function buildPoint(phi, theta, magnitude) {
    var length = magnitude * pointLength;
    var geo = new THREE.CubeGeometry(pointSize, length, pointSize);
    geo.applyMatrix( new THREE.Matrix4().translate( new THREE.Vector3(0, length/2, 0)));    
    geo.applyMatrix( new THREE.Matrix4().rotateZ( - theta ));    
    geo.applyMatrix( new THREE.Matrix4().rotateY( - phi ));    

    var mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors }) );
    
    for (var i = 0; i < geo.faces.length; i++) {
      geo.faces[i].color = colorFn(magnitude);
    }
  
    var v = PTToVertex(phi, theta, radius);
    mesh.position.x = v.x;
    mesh.position.y = v.y;
    mesh.position.z = v.z;

    scene.add(mesh);
  }

  function addPoint(lng, lat, magnitude) {
    var coord = lngLatToPT(lng, lat);
    buildPoint(coord[0], coord[1], magnitude);
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
    renderer.setSize($container.width(), $container.height());
  }

  function zoom(d) { 
    distance = d;
  }

  function render() {
    phi += 0.01
    camera.position.x = Math.sin(phi) * Math.cos(theta) * distance
    camera.position.y = Math.sin(theta) * distance + cameraHeight;
    camera.position.z = Math.cos(phi) * Math.cos(theta) * distance

    camera.lookAt(new THREE.Vector3(0,0,0));
 
    //var t = Date.now() * 0.001;
    //uniforms.sunDirection.value.x = Math.sin(t);
    //uniforms.sunDirection.value.y = Math.cos(t);

    // Note: Since the earth is at 0,0,0 you can set the normal for the sun
    // with
    //
    //uniforms.sunDirection.value.copy(sunPosition);
    //uniforms.sunDirection.value.normalize();

    //for( var i = 0; i < meshes.length; ++ i ) {
      //meshes[ i ].rotation.y += 0.01 * ( i % 2 ? 1 : -1 );
      //meshes[ i ].rotation.x += 0.01 * ( i % 2 ? -1 : 1 );
    //}
    
    renderer.render( scene, camera );
  }
 
  init();
  animate();

  globe.addPoint = addPoint;
  globe.buildPoint = buildPoint;

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
