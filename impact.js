//
// The spinning cube example with Phong shading in Three.js, using
// a Three.js camera with the camera controls from homework 3.
//

var height = 2;
var width = 3;
var depth = .1;
width = 0.5 * width;
height = 0.5 * height;

var ourCanvas;

var fragCount = 0;
var gridSize = 0.025;

var impactPoint;
var impactForce = 10;

var axis = 'z';
var paused = true;
var camera;

//translate keypress events to strings
//from http://javascript.info/tutorial/keyboard-events
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
  
  // vector.set(
  //     ( event.clientX / window.innerWidth ) * 2 - 1,
  //     - ( event.clientY / window.innerHeight ) * 2 + 1,
  //     0.5 );
//console.log(event.clientX, window.innerWidth);

var X = event.pageX - ourCanvas.offsetLeft 
var Y = event.pageY - ourCanvas.offsetTop

vector.set(
  ( X / 600 ) * 2 - 1,
  - ( Y / 400 ) * 2 + 1,
  0.5 );
console.log(X, Y);
      
  
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

  var scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 30, 1.5, 0.1, 1000 );
  camera.position.set(1, 2.5, 5);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  
  ourCanvas = document.getElementById('theCanvas');
  var renderer = new THREE.WebGLRenderer({canvas: ourCanvas});

  // Choose a geometry
  //var geometry = new THREE.PlaneGeometry(3, 2);
  //var geometry = new THREE.BoxGeometry( 3, 2, .2 );
  //var geometry = new THREE.SphereGeometry(1);
  
  // Choose a material
  //var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  //var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );

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

  // (**) If cube is not centered at origin, notice that 2nd and 3rd rotation
  // examples do the rotation extrinsically
  //cube.position.set(0.5, 0, 0);
  
  var render = function () {
    renderer.render(scene, camera);
    var increment = 1.0 * Math.PI / 180.0;  // convert to radians
    if (!paused)
    {
      
      // Note about rotations: it is tempting to use cube.rotation.x += increment
      // here.  But that won't give the behavior we expect, because threejs uses
      // the 'rotation' attribute as a set of Euler angles, applied in a specific
      // order. See EulerThreejs.js.
      // 
      // In most applications you would use methods for "intrinsic" rotations,
      // rotateX(), rotateY(), and rotateZ(), rotateOnAxis().
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

        // If you want to do an extrinsic rotation (similar to previous
    	    // rotating cube example), you have to update the 
        // rotation of the object, but not the combined TRS matrix.
        // Again, you can't just alter the 'rotation.xyz' attributes,
        // because those are Euler angles.  Internally, the rotation
        // is stored as a quaternion, and we can left-multiply it by 
        // another quaternion to get an extrinsic rotation.
//        var q;
//        switch(axis)
//        {
//        case 'x':
//          // create a quaternion representing a rotation about x axis
//          q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0),  increment);       
//          break;
//        case 'y':
//          q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0),  increment);
//          break;
//        case 'z':
//          q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1),  increment);
//          break;       
//        default:
//        }
//        // left-multiply the cube's quaternion, and then set the new value
//        cube.setRotationFromQuaternion(q.multiply(cube.quaternion))
  //  
    	
      //
      // It is also possible to left-multiply the entire TRS matrix
    	  // for the object, but this is not often what you want, because
    	  // it will rotate the object relative to the world origin
    	  // *after* translating it.  Try setting the cube's position
    	  // in the line marked (**) above, and then perform this rotation.
      // The applyMatrix performs a left-multiplication of the object's
      // complete translation * rotation * scale by the given matrix,
      // and then updates the translation, rotation, and scale from it.
      // However, a warning: if you alter the object by setting some 
      // other attribute such as the position, you have to call updateMatrix()
      // before calling applyMatrix.  Otherwise it will just perform a multiplication
      // of the current matrix without taking the position into account.
//      switch(axis)
//      {
//      case 'x':
//        cube.applyMatrix(new THREE.Matrix4().makeRotationX(increment));
//        break;
//      case 'y':
//        cube.applyMatrix(new THREE.Matrix4().makeRotationY(increment));  
//        break;
//      case 'z':
//        cube.applyMatrix(new THREE.Matrix4().makeRotationZ(increment));    
//        break;
//      default:
//      }   
     
      
    }
    requestAnimationFrame( render );
  };

  render();

}