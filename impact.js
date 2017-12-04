var height = 2;
var width = 3;
// var depth = .1;
width = 0.5 * width;
height = 0.5 * height;

var ourCanvas;
var scene;
var solidShape;

var impactPoint;
var shatterLayerRange = 10;
var shatterShardCountMin = 5;
var shatterShardCountMax = 10;
var shardWidthMin = 10;

var camera;

function onDocumentMouseClick(event) {

    // Get values
    var impactForce = parseInt(document.getElementById("impactForceVal").innerHTML);
    var materialStrength = parseInt(document.getElementById("materialStrengthVal").innerHTML);
    var crackCountRange = parseInt(document.getElementById("crackRangeVal").innerHTML);

    var inWidth = impactPoint.position.x > -width && impactPoint.position.x < width;
    var inHeight = impactPoint.position.y > -height && impactPoint.position.y < height;

    var shatterPercent = 0.0;

    if (inWidth && inHeight) {
        // Shatter whole thing
        if (impactForce >= materialStrength) {
            shatterPercent = 1.0;
        } else {
            shatterPercent = (Math.random() * (1 - (materialStrength - impactForce)/100.0)).toFixed(4);
        }

        // cracking after shatter portion
        var crackCount = Math.floor(Math.random() * crackCountRange);

        var shatterDistance = height > width ? height * shatterPercent : width * shatterPercent;

        var shatterLayerCount = Math.floor(Math.random() * shatterLayerRange) + 1;
        console.log("Shatter Layers: " + shatterLayerCount);
        var shatterLayerDistance = shatterDistance / shatterLayerCount;

        var shatterLayers = [];

        var startPoint = {'x': impactPoint.position.x, 'y': impactPoint.position.y};

        // generate layer 1
        shatterLayers.push(layer1(startPoint,shatterLayerDistance));


        // draw first layer
        for(var i = 1; i < shatterLayers[0].length - 1; i++){
            var point1 = startPoint;
            var point2 = shatterLayers[0][i];
            var point3 = shatterLayers[0][i + 1 > shatterLayers[0].length - 2 ? 1 : i + 1];

            var mat = new THREE.LineBasicMaterial({color: 0x000000});
            var geo = new THREE.Geometry();
            geo.vertices.push(
                new THREE.Vector3(point1['x'], point1['y'], .001),
                new THREE.Vector3(point2['x'], point2['y'], .001)
            );
            var line = new THREE.Line(geo, mat);
            scene.add(line);

            var mat = new THREE.LineBasicMaterial({color: 0x000000});
            var geo = new THREE.Geometry();
            geo.vertices.push(
                new THREE.Vector3(point2['x'], point2['y'], .001),
                new THREE.Vector3(point3['x'], point3['y'], .001)
            );
            var line = new THREE.Line(geo, mat);
            scene.add(line);

            var mat = new THREE.LineBasicMaterial({color: 0x000000});
            var geo = new THREE.Geometry();
            geo.vertices.push(
                new THREE.Vector3(point3['x'], point3['y'], .001),
                new THREE.Vector3(point1['x'], point1['y'], .001)
            );
            var line = new THREE.Line(geo, mat);
            scene.add(line);
        }
        
        



        for(var i = 0; i < shatterLayerCount; ++i){
          
          
          
        }

        // console.log("Layers");
        // shatterLayers[0].forEach(function(coord) {
        //     console.log(coord);
        // });


    }
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function layer1(startPoint, shatterLayerDistance){
    var shatterShardCount = Math.floor((Math.random() * (shatterShardCountMax-shatterShardCountMin)) + shatterShardCountMin);

    var remainingSpace = 360;
    var lastWidth = 0;
    var shardWidthRunningCount = 0;
    var layer = []
    layer.push(startPoint);
    var first_x = startPoint['x'] + (Math.random() * shatterLayerDistance);
    layer.push({'x': first_x > width ? width : first_x, 'y': startPoint['y']});

    for(var sc = 1; sc < shatterShardCount; ++ sc){
      console.log("Shard " + sc);

      // if last shard, take all remaining space
      var shardWidth = remainingSpace/(shatterShardCount - sc);
      if(sc < shatterShardCount - 1){
        shardWidth = Math.floor(shardWidth + (Math.random() * (Math.random() > .5 ? shardWidth : - shardWidth)));
        remainingSpace -= shardWidth;
      }
      console.log(shardWidth);
      if(shardWidth < shardWidthMin){
          console.log("Skipped Shard");
          continue;
      }

      var absolutWidth = shardWidth + lastWidth;

      var shardLen = (Math.random() * shatterLayerDistance);
      var riseAmnt = shardLen * Math.sin(toRadians(absolutWidth));
      var slideAmnt = shardLen * Math.cos(toRadians(absolutWidth));

      //Add point to layer
      var new_x = startPoint['x'] + slideAmnt;
      var new_y = startPoint['y'] + riseAmnt;
      new_x = new_x > width ? width : new_x < -width ? -width : new_x;
      new_y = new_y > height ? height : new_y < -height ? -height : new_y;
      layer.push({'x': new_x, 'y': new_y});

      shardWidthRunningCount += shardWidth;
      lastWidth = lastWidth + shardWidth;
    }

    return layer;
}

/*
 *  Using sliders now
 */

// function getChar(event) {
//     if (event.which === null) {
//         return String.fromCharCode(event.keyCode) // IE
//     } else if (event.which !== 0 && event.charCode !== 0) {
//         return String.fromCharCode(event.which)   // the rest
//     } else {
//         return null // special key
//     }
// }
//
// function handleKeyPress(event) {
//     var ch = getChar(event);
//     if (cameraControl(camera, ch)) {
//         return;
//     }
//
//     switch (ch) {
//         case 'z':
//             impactForce -= 1;
//             document.getElementById("impactForce").innerHTML = impactForce.toString();
//             return;
//         case 'Z':
//             impactForce += 1;
//             document.getElementById("impactForce").innerHTML = impactForce.toString();
//             return;
//         case 'x':
//             materialStrength -= 1;
//             document.getElementById("materialStrength").innerHTML = materialStrength.toString();
//             return;
//         case 'X':
//             materialStrength += 1;
//             document.getElementById("materialStrength").innerHTML = materialStrength.toString();
//             return;
//         case 'c':
//             crackCountRange -= 1;
//             document.getElementById("crackRange").innerHTML = crackCountRange.toString();
//             return;
//         case 'C':
//             crackCountRange += 1;
//             document.getElementById("crackRange").innerHTML = crackCountRange.toString();
//             return;
//         case 'v':
//             impactForce = 100;
//             materialStrength = 100;
//             crackCountRange = 10;
//             document.getElementById("impactForce").innerHTML = impactForce.toString();
//             document.getElementById("materialStrength").innerHTML = materialStrength.toString();
//             document.getElementById("crackRange").innerHTML = crackCountRange.toString();
//             return;
//         default:
//             return;
//     }
// }


function onDocumentMouseMove(event) {
    var vector = new THREE.Vector3();

    var X = event.pageX - ourCanvas.offsetLeft;
    var Y = event.pageY - ourCanvas.offsetTop;

    vector.set(
        (X / 600) * 2 - 1,
        -(Y / 400) * 2 + 1,
        0.5);

    vector.unproject(camera);

    var dir = vector.sub(camera.position).normalize();

    var distance = -camera.position.z / dir.z;

    var pos = camera.position.clone().add(dir.multiplyScalar(distance));

    impactPoint.position.x = pos.x;
    impactPoint.position.y = pos.y;

}

function start() {

    // Handle default vars
    // document.getElementById("impactForce").innerHTML = impactForce.toString();
    // document.getElementById("materialStrength").innerHTML = materialStrength.toString();
    // document.getElementById("crackRange").innerHTML = crackCountRange.toString();


    //window.onkeypress = handleKeyPress;
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener("click", onDocumentMouseClick);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, 1.5, 0.1, 1000);
    camera.position.set(1, 2.5, 5);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    ourCanvas = document.getElementById('theCanvas');
    var renderer = new THREE.WebGLRenderer({canvas: ourCanvas});

    // THREE.BackSide
    // THREE.DoubleSide
    var material = new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        specular: 0x222222,
        shininess: 1000,
        side: THREE.DoubleSide /*shading: THREE.FlatShading*/
    });


    var shape = new THREE.Shape();
    shape.moveTo(-width, -height);
    shape.lineTo(width, -height);
    shape.lineTo(width, height);
    shape.lineTo(-width, height);


    solidShape = new THREE.Mesh(new THREE.ShapeGeometry(shape), material);

    scene.add(solidShape);

    // Make some axes
    material = new THREE.LineBasicMaterial({color: 0xff0000});
    var geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(2, 0, 0)
    );
    var line = new THREE.Line(geometry, material);
    scene.add(line);

    material = new THREE.LineBasicMaterial({color: 0x00ff00});
    geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 2, 0)
    );
    line = new THREE.Line(geometry, material);
    scene.add(line);

    material = new THREE.LineBasicMaterial({color: 0x0000ff});
    geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 2)
    );
    line = new THREE.Line(geometry, material);
    scene.add(line);

    material = new THREE.LineBasicMaterial({color: 0xffffff});
    geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(0, 0, 2),
        new THREE.Vector3(0, 0, -2)
    );
    impactPoint = new THREE.Line(geometry, material);
    scene.add(impactPoint);

    // Put a point light in the scene
    var light = new THREE.PointLight(0xffffff, 1.0);
    light.position.set(-2, 3, 5);
    scene.add(light);

    // Put in an ambient light
    light = new THREE.AmbientLight(0x555555);
    scene.add(light);

    var render = function () {
        renderer.render(scene, camera);



        requestAnimationFrame(render);
    };

    render();
}
