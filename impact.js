var height = 3;
var width = 3;
width = 0.5 * width;
height = 0.5 * height;

var objectMaterial = new THREE.MeshPhongMaterial({
    specular: 0x222222,
    shininess: 1000,
    side: THREE.DoubleSide,
    color: 0x00ffff,
    opacity: 0.4,
    transparent: true
});

var lineMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe:true, side: THREE.BackSide});


var ourCanvas;
var scene;
var solidShape;
var solidShapeShape;
var fragments = [];
var leftShape;

var drawLines = false; // TODO boostrap switch
var animate = true; // TODO boostrap switch
var experimental = false; // TODO boostrap switch
// TODO make buttons for everything in handleKeyPress
// TODO update frame counter under canvas 

var impactPoint;
var fragmentSpeedVariable = .009;
var fragmentRotationVariable = .005;
var frameNumber = 0;
var lastFrame = 0;
var isBroken = false;
var frameIncrement = 3;

var camera;
var infoTable;

function onDocumentMouseClick(event) {
    frameNumber = 0;
    // Get values
    var impactForce = parseInt(document.getElementById("impactForceVal").innerHTML);
    var materialStrength = parseInt(document.getElementById("materialStrengthVal").innerHTML);
    var appendageCount = parseInt(document.getElementById("crackRangeVal").innerHTML);
    var numOfShatterLayers = Math.floor(randomFromInterval(3, 10));
    

    var inWidth = impactPoint.position.x > -width && impactPoint.position.x < width;
    var inHeight = impactPoint.position.y > -height && impactPoint.position.y < height;

    var shatterPercent = 0.0;

    if (inWidth && inHeight) {
        isBroken = true;
        // Shatter whole thing
        if (impactForce >= materialStrength) {
            shatterPercent = 1.0;
        } else {
            shatterPercent = (Math.random() * (1 - (materialStrength - impactForce)/100.0)).toFixed(4);
        }

        var shatterDistance = height > width ? height * shatterPercent : width * shatterPercent;

        info("Shatter Distance: " + shatterDistance);
        info("Shatter Layers: " + numOfShatterLayers);

        var shatterLayerDistance = (shatterDistance / numOfShatterLayers);

        info("Shatter Distance / Layer: " + shatterLayerDistance);

        var shatterLayers = [];
        var startPoint = {'x': impactPoint.position.x, 'y': impactPoint.position.y};
        var startAngle = Math.floor(randomFromInterval(1, 360));

        info("Starting Point: x:" + startPoint['x'].toFixed(6) + " y:" + startPoint['y'].toFixed(6));
        info("Start Angle: " + startAngle);
        info("Line Count: " + appendageCount);

        // generate layer 1
        info("<b>Layer 1</b>");
        if(experimental){
            var total = Math.pow(numOfShatterLayers, 2);
            var percent = 1/total;
            shatterLayers.push(generateLayer(startPoint, startAngle, shatterDistance * percent, appendageCount));
        }
        else{
            shatterLayers.push(generateLayer(startPoint, startAngle, shatterLayerDistance, appendageCount));
        }
        
        

        // generate layer 1 shapes
        var gL = shatterLayers[0].length;
        for(var i = 0; i < gL; ++i){
            var shape = new THREE.Shape();
            shape.moveTo(
                startPoint['x'],
                startPoint['y'],
                .1);

            shape.lineTo(
                cW(shatterLayers[0][i]['x']),
                 cH(shatterLayers[0][i]['y']),
                  .1);

            shape.lineTo(
                cW(shatterLayers[0][i + 1 >= gL ? 0 : i + 1]['x']),
                cH(shatterLayers[0][i + 1 >= gL ? 0 : i + 1]['y']),
                  .1);
    
            var t_mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), drawLines ? lineMaterial : objectMaterial);
        
            scene.add(t_mesh);
            fragments.push(t_mesh);
        }


        // generate layer n shapes
        for(var i = 1; i <= numOfShatterLayers; ++i){
            info("<b>Layer: " + (i+1) + "</b>");
            if(experimental && i == numOfShatterLayers){
                shatterLayers.push(generateLayer(startPoint, startAngle, (shatterLayerDistance * i) + randomFromInterval(0,shatterLayerDistance), appendageCount))
            }else{
                if(experimental){
                    var total = Math.pow(numOfShatterLayers, 2);
                    var part = Math.pow(i, 2);
                    var percent = part/total;
                    shatterLayers.push(generateLayer(startPoint, startAngle, percent*shatterDistance, appendageCount))
                }else{
                    shatterLayers.push(generateLayer(startPoint, startAngle, (shatterLayerDistance * i), appendageCount))
                }
                
            }
        }

        // create layer n shapes and lines 
        gL = shatterLayers.length - 1;
        // for each layer after first layer
        for(var l = 1; l <= gL; ++l){
            var LL = shatterLayers[l].length;
            for(var i = 0; i < LL; ++i){
                
                var p1 = shatterLayers[l - 1][i];
                var p2 = shatterLayers[l][i];
                var p3 = shatterLayers[l][i + 1 >= LL ? 0 : i + 1];
                var p4 = shatterLayers[l -1][i + 1 >= shatterLayers[l -1].length ? 0 : i + 1];

                var shape = new THREE.Shape();
                shape.moveTo(
                    cW(p1['x']),
                    cH(p1['y']),
                    .1);

                if(experimental){

                    shape.lineTo(
                        cW(p2['x']), 
                        cH(p2['y']),
                          .1);
        
                    shape.lineTo(
                        cW(p3['x']),
                        cH(p3['y']),
                          .1);

                    try{
                        var t_mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), drawLines ? lineMaterial : objectMaterial);
                        scene.add(t_mesh);
                        fragments.push(t_mesh);
                    }catch(err){
                        console.error(err);
                    }

                    var shape = new THREE.Shape();
                    shape.moveTo(
                        cW(p1['x']),
                        cH(p1['y']),
                        .1);

                    shape.lineTo(
                        cW(p3['x']),
                        cH(p3['y']),
                        .1);
    
                    shape.lineTo(
                        cW(p4['x']),
                        cH(p4['y']),
                        .1);
            
                    try{
                        var t_mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), drawLines ? lineMaterial : objectMaterial);
                        scene.add(t_mesh);
                        fragments.push(t_mesh);
                    }catch(err){
                        console.error(err);
                    }

                }else{
                    shape.lineTo(
                        cW(p2['x']), 
                        cH(p2['y']),
                          .1);
        
                    shape.lineTo(
                        cW(p3['x']),
                        cH(p3['y']),
                          .1);
    
                    shape.lineTo(
                        cW(p4['x']),
                        cH(p4['y']),
                        .1);
            
                    try{
                        var t_mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), drawLines ? lineMaterial : objectMaterial);
                        scene.add(t_mesh);
                        fragments.push(t_mesh);
                    }catch(err){
                        console.error(err);
                    }
                }
            }
        }


        // generate 'large' ouside piece
        var vectors = [];
        shatterLayers[shatterLayers.length-1].forEach(function(point){
            vectors.push(new THREE.Vector3(cW(point['x']),cH(point['y']),.1));
        });
        var path = new THREE.Path(vectors);
        scene.remove(solidShape);
        solidShapeShape.holes.push(path);
        leftShape = new THREE.Mesh(new THREE.ShapeGeometry(solidShapeShape), objectMaterial);
        scene.add(leftShape);


        // Fragment Movement
        fragments.forEach(function(fragment){
         animateFragment(fragment, startPoint)  
        });
    }
}

function animateFragment(fragment, startPoint){
    var x_sum = 0;
    var y_sum = 0;
    fragment.geometry.vertices.forEach(function(vertex){
        x_sum += vertex.x;
        y_sum += vertex.y;
    });

    var x_avg = x_sum / fragment.geometry.vertices.length;
    var y_avg = y_sum / fragment.geometry.vertices.length;
    
    if(drawLines){
        var dotGeometry = new THREE.Geometry();
        dotGeometry.vertices.push(new THREE.Vector3( x_avg, y_avg, .01));
        var dot = new THREE.Points( dotGeometry, lineMaterial );
        scene.add( dot );
    }

    var fragment_center = {x: x_avg, y: y_avg };
    var distanceFromCenter = pointDistance(startPoint, fragment_center);
    var angleDeg = to_positive_angle(Math.atan2(y_avg - startPoint['y'], x_avg - startPoint['x']) * 180 / Math.PI);
    var moveSpinPerc = 1/(1 + Math.pow(distanceFromCenter,2));
    fragment['moveSpinPerc'] = moveSpinPerc;
    fragment['spinAngle'] = angleDeg;
}


function generateLayer(point, startAngle, distance, points){
    var layer = [];
    var increment = 360/points;
    for(var i = 0; i < points; ++i){
        var rads = toRadians(startAngle + (increment * i));
        var riseAmnt = distance * Math.sin(rads);
        var runAmnt = distance * Math.cos(rads);
        if(experimental){
            runAmnt = runAmnt + (Math.random() * .25 * runAmnt);
            riseAmnt = riseAmnt + (Math.random() * .25 * riseAmnt);
            layer.push({x: point['x'] + runAmnt, y: point['y'] + riseAmnt});
            info("Point: " + (point['x'] + runAmnt).toFixed(6) + " " + (point['y'] + riseAmnt).toFixed(6) + " Angle: " + (startAngle + (increment * i)));
        }else{
            layer.push({x: point['x'] + runAmnt, y: point['y'] + riseAmnt});
            info("Point: " + (point['x'] + runAmnt).toFixed(6) + " " + (point['y'] + riseAmnt).toFixed(6) + " Angle: " + (startAngle + (increment * i)));
        }
        
    }

    return layer;
}

function cW(val){
    return val >= width ? width : val < -width ? -width : val;
}

function cH(val){
    return val >= height ? height : val < -height ? -height : val;
}



function pointDistance(p1, p2){
    return Math.sqrt(Math.pow(p2['x'] - p1['x'],2) + Math.pow(p2['y'] - p1['y'],2));
}


function toRadians (angle) {
  return angle * (Math.PI / 180);
}


function randomFromInterval(min,max)
{
    return (Math.random()*(max-min+1)+min);
}

function to_positive_angle(angle)
{
   angle = angle % 360;
   while(angle < 0) { 
     angle += 360.0;
   }

   return angle;
}



function getChar(event) {
    if (event.which === null) {
        return String.fromCharCode(event.keyCode) // IE
    } else if (event.which !== 0 && event.charCode !== 0) {
        return String.fromCharCode(event.which)   // the rest
    } else {
        return null // special key
    }
}

function handleKeyPress(event) {
    var ch = getChar(event);
    if(ch == ']'){
        frameNumber ++;
    }
    if(ch == '['){
        frameNumber --;
        if(frameNumber < 0){
            frameNumber = 0;
        }
    }

    if(ch == 'H'){
        drawLines = !drawLines;
    }

    if(ch == 'R'){
        reset();
    }

    if(ch == 'E'){
        experimental = !experimental;
    }

    if(ch == ' '){
        animate = !animate;
    }

    cameraControl(camera, ch);
}


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

function info(string){
    infoTable.innerHTML += "<br/>"+ string;
}

function reset(){
    infoTable = document.getElementById("infoTable");
    infoTable.innerHTML = "";

    fragments.forEach(function(fragment){
        scene.remove(fragment);
    });

    fragments = [];
    isBroken = false;

    if(solidShape){
        scene.remove(solidShape);
    }

    if(leftShape){
        scene.remove(leftShape);
    }

    solidShapeShape = new THREE.Shape();
    solidShapeShape.moveTo(-width, -height);
    solidShapeShape.lineTo(width, -height);
    solidShapeShape.lineTo(width, height);
    solidShapeShape.lineTo(-width, height);


    solidShape = new THREE.Mesh(new THREE.ShapeGeometry(solidShapeShape), objectMaterial);

    scene.add(solidShape);
}

function start() {

    window.onkeypress = handleKeyPress;
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener("click", onDocumentMouseClick);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, 1.5, 0.1, 1000);
    camera.position.set(1, 2.5, 5);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    ourCanvas = document.getElementById('theCanvas');
    var renderer = new THREE.WebGLRenderer({canvas: ourCanvas});

    reset();

    // Impact point marker line
    var impactGeo = new THREE.Geometry();
    impactGeo.vertices.push(
        new THREE.Vector3(0, 0, 2),
        new THREE.Vector3(0, 0, -2)
    );
    impactPoint = new THREE.Line(impactGeo, new THREE.LineBasicMaterial({color: 0xffffff}));
    scene.add(impactPoint);


    // Put a point light in the scene
    var light = new THREE.PointLight(0xffffff, 1.0);
    light.position.set(-2, 3, 5);
    scene.add(light);

    // Put in an ambient light
    light = new THREE.AmbientLight(0x555555);
    scene.add(light);


    var render = function () {
        if(isBroken && lastFrame != frameNumber){
            fragments.forEach(function(fragment){
                fragment.position.z = -(frameNumber * (fragmentSpeedVariable )) * fragment['moveSpinPerc'];

                var riseAmnt = fragment['moveSpinPerc'] * Math.sin(toRadians(fragment['spinAngle']));
                var runAmnt = fragment['moveSpinPerc'] * Math.cos(toRadians(fragment['spinAngle']));

                fragment.rotation.y = (frameNumber * riseAmnt * fragmentRotationVariable);
                fragment.rotation.x = (frameNumber * runAmnt * fragmentRotationVariable);
                
                lastFrame = frameNumber;
            });
        }

        if(animate){
            frameNumber += frameIncrement;
            if(frameNumber > 1000 && frameNumber < 1500){
                isBroken = false;
            }

            if(frameNumber > 1500){
                frameNumber = 0;
                isBroken = true;
            }
        }

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    };

    render();
}
