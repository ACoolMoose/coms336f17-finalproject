

var height = 2;
var width = 3;
var depth = .1;
width = 0.5 * width;
height = 0.5 * height;

var ourCanvas;

var impactPoint;
var impactForce = 100;
var crackCountRange = 10;
var materialStrength = 100;

var axis = 'z';
var paused = true;
var camera;

function onDocumentMouseClick(event){
  var inWidth = impactPoint.position.x > -width && impactPoint.position.x < width;
  var inHeight = impactPoint.position.y > -height && impactPoint.position.y < height;

  var shatterPercent = 0.0;
  
  if(inWidth && inHeight){
    // Shatter whole thing
    if(impactForce >= materialStrength){
      shatterPercent = 1.0;
    }else{
      shatterPercent = Math.floor(Math.random() * (materialStrength - impactForce));
    }

    // cracking after shatter portion
    var crackCount = Math.floor(Math.random() * crackCountRange);

    // todo
    
  }
}


function getChar(event) {
if (event.which == null) {
 return String.fromCharCode(event.keyCode) // IE
} else if (event.which!=0 && event.charCode!=0) {
 return String.fromCharCode(event.which)   // the rest
} else {
 return null // special key
}
}


function handleKeyPress(event)
{
  var ch = getChar(event);
  if (cameraControl(camera, ch)){
    return;
  } 
  
  switch(ch)
  {
  case ' ':
    paused = !paused;
    break;
  case 'x':
    axis = 'x';
    break;
  case 'y':
    axis = 'y';
    break;
  case 'z':
    axis = 'z';
    break;
  default:
    return;
  }
}


function onDocumentMouseMove( event ) {
  var vector = new THREE.Vector3();


  var X = event.pageX - ourCanvas.offsetLeft 
  var Y = event.pageY - ourCanvas.offsetTop

  vector.set(
    ( X / 600 ) * 2 - 1,
    - ( Y / 400 ) * 2 + 1,
    0.5 );
      
  vector.unproject( camera );

  var dir = vector.sub( camera.position ).normalize();

  var distance = - camera.position.z / dir.z;

  var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );

  impactPoint.position.x = pos.x;
  impactPoint.position.y = pos.y;

}

function start()
{
  window.onkeypress = handleKeyPress;
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener("click", onDocumentMouseClick);

  var scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 30, 1.5, 0.1, 1000 );
  camera.position.set(1, 2.5, 5);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  
  ourCanvas = document.getElementById('theCanvas');
  var renderer = new THREE.WebGLRenderer({canvas: ourCanvas});

  // THREE.BackSide
  // THREE.DoubleSide
  var material = new THREE.MeshPhongMaterial( { color: 0x00ff00, specular: 0x222222, shininess: 1000, side: THREE.DoubleSide /*shading: THREE.FlatShading*/ } );


  var shape = new THREE.Shape();
  shape.moveTo(-width, -height);
  shape.lineTo(width, -height);
  shape.lineTo(width, height);
  shape.lineTo(-width, height);
  
  
  
  var mesh = new THREE.Mesh( new THREE.ShapeGeometry(shape), material );

  scene.add(mesh);
  
  // Make some axes
  var material = new THREE.LineBasicMaterial({color: 0xff0000});
  var geometry = new THREE.Geometry();
  geometry.vertices.push(
    new THREE.Vector3( 0, 0, 0 ),
    new THREE.Vector3( 2, 0, 0 )
  );
  var line = new THREE.Line( geometry, material );
  scene.add( line );
  
  material = new THREE.LineBasicMaterial({color: 0x00ff00});
  geometry = new THREE.Geometry();
  geometry.vertices.push(
    new THREE.Vector3( 0, 0, 0 ),
    new THREE.Vector3( 0, 2, 0 )
  );
  line = new THREE.Line( geometry, material );
  scene.add( line );

  material = new THREE.LineBasicMaterial({color: 0x0000ff});
  geometry = new THREE.Geometry();
  geometry.vertices.push(
    new THREE.Vector3( 0, 0, 0 ),
    new THREE.Vector3( 0, 0, 2 )
  );
  line = new THREE.Line( geometry, material );
  scene.add( line );

  material = new THREE.LineBasicMaterial({color: 0xffffff});
  geometry = new THREE.Geometry();
  geometry.vertices.push(
    new THREE.Vector3( 0, 0, 2 ),
    new THREE.Vector3( 0, 0, -2 )
  );
  impactPoint = new THREE.Line( geometry, material );
  scene.add( impactPoint );

  // Put a point light in the scene
  var light = new THREE.PointLight(0xffffff, 1.0);
  light.position.set(-2, 3, 5);
  scene.add(light);
  
  // Put in an ambient light
  light = new THREE.AmbientLight(0x555555);
  scene.add(light);
  
  var render = function () {
    renderer.render(scene, camera);
    var increment = 1.0 * Math.PI / 180.0;  // convert to radians
    if (!paused)
    {
      switch(axis)
      {
      case 'x':
        cube.rotateX(increment);
        break;
      case 'y':
        cube.rotateY(increment);
        break;
      case 'z':
        cube.rotateZ(increment);
        break;
      default:
      }
    }
    requestAnimationFrame( render );
  };

  render();
}