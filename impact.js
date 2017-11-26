//
// The spinning cube example with Phong shading in Three.js, using
// a Three.js camera with the camera controls from homework 3.
//

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
    console.log('camera');
    return;
  } 
  
  switch(ch)
  {
  case ' ':
    paused = !paused;
    console.log(paused);
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

function start()
{
  window.onkeypress = handleKeyPress;

  var scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 30, 1.5, 0.1, 1000 );
  camera.position.set(1, 2.5, 5);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  
  var ourCanvas = document.getElementById('theCanvas');
  var renderer = new THREE.WebGLRenderer({canvas: ourCanvas});

  // Choose a geometry
  //var geometry = new THREE.PlaneGeometry(1, 1, 1);
  var geometry = new THREE.BoxGeometry( 3, 2, .2 );
  //var geometry = new THREE.SphereGeometry(1);
  
  // Choose a material
  //var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  //var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
  var material = new THREE.MeshPhongMaterial( { color: 0x00ff00, specular: 0x222222, shininess: 1000, /*shading: THREE.FlatShading*/ } );

  // Create a mesh
  var cube = new THREE.Mesh( geometry, material );
  
  // Add it to the scene
  scene.add( cube );
  
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