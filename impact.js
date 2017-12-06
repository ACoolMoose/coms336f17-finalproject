var height = 2;
var width = 3;
// var depth = .1;
width = 0.5 * width;
height = 0.5 * height;

var ourCanvas;
var scene;
var solidShape;
var fragments = [];
var drawLines = true;

var impactPoint;
var shatterLayerRange = 3;//10
var shatterShardCountMin = 5;
var shatterShardCountMax = 5;//10
var shardWidthMin = 10;

var camera;

function onDocumentMouseClick(event) {

    // Get values
    var impactForce = parseInt(document.getElementById("impactForceVal").innerHTML);
    var materialStrength = parseInt(document.getElementById("materialStrengthVal").innerHTML);
    var appendageCount = parseInt(document.getElementById("crackRangeVal").innerHTML);
    var numOfShatterLayers = Math.floor(randomFromInterval(3, 10));

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

        var shatterDistance = height > width ? height * shatterPercent : width * shatterPercent;

        console.log("Shatter Layers: " + numOfShatterLayers);
        var shatterLayerDistance = (shatterDistance / numOfShatterLayers);

        var shatterLayers = [];

        var startPoint = {'x': impactPoint.position.x, 'y': impactPoint.position.y};
        var startAngle = Math.floor(randomFromInterval(1, 360));

        // generate layer 1
        console.log("Data:", startAngle, shatterLayerDistance, appendageCount);
        shatterLayers.push(generateLayer(startPoint, startAngle, shatterLayerDistance, appendageCount));



        // Draw first layer lines
        if(drawLines){
            shatterLayers[0].forEach(function(line){
                var mat = new THREE.LineBasicMaterial({color: 0xff0000});
                var geo = new THREE.Geometry();
                geo.vertices.push(
                    new THREE.Vector3(startPoint['x'], startPoint['y'], .003),
                    new THREE.Vector3(cW(line['x']), cH(line['y']), .003)
                );
                line = new THREE.Line(geo, mat);
                scene.add(line);
            });
        }
        

        // generate layer 1 shapes
        var gL = shatterLayers[0].length;
        for(var i = 0; i < gL; ++i){
            var mat = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                specular: 0x222222,
                shininess: 1000,
                side: THREE.DoubleSide /*shading: THREE.FlatShading*/
            });
            

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
    
            var t_mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), mat);
        
            scene.add(t_mesh);
            fragments.push(t_mesh);
        }


        // generate layer n shapes
        for(var i = 1; i <= numOfShatterLayers; ++i){
            console.log("Generating Layer:", i);
            shatterLayers.push(generateLayer(startPoint, startAngle, shatterLayerDistance * i, appendageCount))
        }

        // create layer n shapes and lines 
        gL = shatterLayers.length - 1;
        // for each layer after first layer
        for(var l = 1; l <= gL; ++l){
            console.log("Drawing Layer:", l);
            var LL = shatterLayers[l].length;
            for(var i = 0; i < LL; ++i){
                
                var p1 = shatterLayers[l - 1][i];
                var p2 = shatterLayers[l][i];
                var p3 = shatterLayers[l][i + 1 >= LL ? 0 : i + 1];
                var p4 = shatterLayers[l -1][i + 1 >= shatterLayers[l -1].length ? 0 : i + 1];

                if(drawLines){
                    var mat = new THREE.LineBasicMaterial({color: 0xff0000});
                    var geo = new THREE.Geometry();
                    geo.vertices.push(
                        new THREE.Vector3(cW(p1['x']), cH(p1['y']), .003),
                        new THREE.Vector3(cW(p2['x']), cH(p2['y']), .003)
                    );
                    var line = new THREE.Line(geo, mat);
                    scene.add(line);
    
                    var geo = new THREE.Geometry();
                    geo.vertices.push(
                        new THREE.Vector3(cW(p3['x']), cH(p3['y']), .003),
                        new THREE.Vector3(cW(p2['x']), cH(p2['y']), .003)
                    );
                    line = new THREE.Line(geo, mat);
                    scene.add(line);
    
                    var geo = new THREE.Geometry();
                    geo.vertices.push(
                        new THREE.Vector3(cW(p1['x']), cH(p1['y']), .003),
                        new THREE.Vector3(cW(p3['x']), cH(p3['y']), .003)
                    );
                    var line = new THREE.Line(geo, mat);
                    scene.add(line);
                }

                
                var mat = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    specular: 0x222222,
                    shininess: 1000,
                    side: THREE.DoubleSide /*shading: THREE.FlatShading*/
                });
                var shape = new THREE.Shape();
                
                shape.moveTo(
                    cW(p1['x']),
                    cH(p1['y']),
                    .1);
    
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
                    var t_mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), mat);
                    
                    scene.add(t_mesh);
                    fragments.push(t_mesh);
                }catch(err){
                    console.error(err);
                }
                

            }
        }


        
        // generate 'large' ouside pieces


        var increment = 360/appendageCount;
        for(var i = 0; i < appendageCount; ++i){

     





            console.log("big", i);
            var rads = toRadians(startAngle + (increment * i));
            var riseAmnt = shatterDistance * Math.sin(rads);
            var runAmnt = shatterDistance * Math.cos(rads);
            var dump = riseAmnt > runAmnt ? riseAmnt : runAmnt;
            console.log("DUMP", dump, shatterDistance);

            var p1 = {x: startPoint['x'] + runAmnt, y: startPoint['y'] + riseAmnt};

            rads = toRadians(startAngle + (increment * (i)));
            riseAmnt = 2*dump * Math.sin(rads);
            runAmnt = 2*dump * Math.cos(rads);

            var p2 = {x: startPoint['x'] + runAmnt, y: startPoint['y'] + riseAmnt};

            var mat = new THREE.LineBasicMaterial({color: 0x0000ff});
            var geo = new THREE.Geometry();
            geo.vertices.push(
                new THREE.Vector3(cW(p1['x']), cH(p1['y']), .003),
                new THREE.Vector3(cW(p2['x']), cH(p2['y']), .003)
            );
            var line1 = new THREE.Line(geo, mat);
            scene.add(line1);

            // rads = toRadians(startAngle + (increment * (i+1)));
            // riseAmnt = shatterDistance * Math.sin(rads);
            // runAmnt = shatterDistance * Math.cos(rads);

            // var p3 = {x: startPoint['x'] + runAmnt, y: startPoint['y'] + riseAmnt};

            // rads = toRadians(startAngle + (increment * (i+1)));
            // riseAmnt = 2*dump * Math.sin(rads);
            // runAmnt = 2*dump * Math.cos(rads);

            // var p4 = {x: startPoint['x'] + runAmnt, y: startPoint['y'] + riseAmnt};

            // var mat = new THREE.LineBasicMaterial({color: 0x00ffff});
            // var geo = new THREE.Geometry();
            // geo.vertices.push(
            //     new THREE.Vector3(cW(p3['x']), cH(p3['y']), .003),
            //     new THREE.Vector3(cW(p4['x']),  cH(p4['y']), .003)
            // );
            // var line2 = new THREE.Line(geo, mat);
            // scene.add(line2);
            


            
            // var mat = new THREE.MeshPhongMaterial({
            //     color: 0xffffff,
            //     specular: 0x222222,
            //     shininess: 1000,
            //     side: THREE.DoubleSide /*shading: THREE.FlatShading*/
            // });
            // var shape = new THREE.Shape();
            
            // var parts = [p3,p2,p4];
            // var currentPos = p1;
            
            // shape.moveTo(
            //     p1['x'],
            //     p1['y'],
            //     .1);

            //     for(var checker = 0; checker < 3; checker++){
            //         var check = pointDistance(currentPos, parts[checker]);
            //         console.log("CHeck:", check);
            //         if(check > .001){
            //             shape.lineTo(parts[checker]['x'], parts['y'], .1);
            //             currentPos = parts[checker];
            //         }
            //     }
    
            // try{
            //     var t_mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), mat);
                
            //     scene.add(t_mesh);
            //     fragments.push(t_mesh);
            // }catch(err){
            //     console.error(err);
            // }
        }

        //remove org object
        //scene.remove(solidShape);
    }
}


function generateLayer(point, startAngle, distance, points){
    console.log("Generating", points, "points at distance", distance, "starting from angle", startAngle);
    var layer = [];
    var increment = 360/points;
    for(var i = 0; i < points; ++i){
        var rads = toRadians(startAngle + (increment * i));
        var riseAmnt = distance * Math.sin(rads);
        var runAmnt = distance * Math.cos(rads);
        layer.push({x: point['x'] + runAmnt, y: point['y'] + riseAmnt});
    }

    return layer;
}

function withinShape(val){
    var x = val['x'];
    var y = val['y'];
    return x < width && x > -width && y < height && y > -height;
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

function toDegrees (angle) {
    return angle * (180 / Math.PI);
  }

function layer1(startPoint, shatterLayerDistance){
    var shatterShardCount = Math.floor((Math.random() * (shatterShardCountMax-shatterShardCountMin)) + shatterShardCountMin);
    console.log("Shatter Count:", shatterShardCount - 1); // DISPLAY

    var remainingSpace = 360;
    var lastWidth = 0;
    var shardWidthRunningCount = 0;
    var layer = [];
    //var first_x = startPoint['x'] + Math.floor(Math.random()*(shatterLayerDistance-(shatterLayerDistance/2)+1)+(shatterLayerDistance/2));
    var first_x = startPoint['x'] + randomFromInterval(shatterLayerDistance/2, shatterLayerDistance);
    console.log("Shatter Dist", shatterLayerDistance); // DISPLAY
    layer.push({'x': first_x > width ? width : first_x, 'y': startPoint['y']});

    for(var sc = 1; sc < shatterShardCount - 1; ++ sc){

      // if last shard, take all remaining space
      var shardWidth = remainingSpace/(shatterShardCount - sc);
      if(sc < shatterShardCount - 1){
        shardWidth = Math.floor(shardWidth + (Math.random() > .5 ? shardWidth * .25 : - shardWidth * .25));
        remainingSpace -= shardWidth;
      }
      
      if(shardWidth < shardWidthMin){
          console.log("Skipped");
          
      }else{
        //console.log("Shard:", shardWidth);  // DISPLAY
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

      
    }
    //console.log("Remaining:", remainingSpace); // DISPLAY (last shard)

    return layer;
}

function layerN(outsidePoints, shatterLayerDistance){
    var layer = [];

    for(var i = 0; i < outsidePoints.length; i++){
        var i1 = i;
        var i2 = i - 1 < 0 ? outsidePoints.length - 1 : i - 1;
        var i3 = i + 1 === outsidePoints.length ? 0 : i + 1;

        var point = outsidePoints[i1];
        var right = outsidePoints[i2];
        var left = outsidePoints[i3];

        console.log(i1, i2, i3);

        var reverseLeft = { x: point['x'] - (left['x'] - point['x']), y: point['y'] - (left['y'] - point['y']) };
        var reverseRight = { x: point['x'] - (right['x'] - point['x']), y: point['y'] - (right['y'] - point['y']) };

        // Show reverse lines
        if(true){
            var mat = new THREE.LineBasicMaterial({color: 0xffffff});
            var geo = new THREE.Geometry();
            geo.vertices.push(
                new THREE.Vector3(point['x'], point['y'], .003),
                new THREE.Vector3(reverseLeft['x'], reverseLeft['y'], .003)
            );
            var line = new THREE.Line(geo, mat);
            scene.add(line);
            geo = new THREE.Geometry();
            geo.vertices.push(
                new THREE.Vector3(point['x'], point['y'], .003),
                new THREE.Vector3(reverseRight['x'], reverseRight['y'], .003)
            );
            var line = new THREE.Line(geo, mat);
            scene.add(line);
        }

        var angleLeft = toDegrees(Math.atan2(left['y'] - point['y'], left['x'] - point['x']));
        var angleRight = toDegrees(Math.atan2(right['y'] - point['y'], right['x'] - point['x']));
        var angleReverseLeft = toDegrees(Math.atan2(reverseLeft['y'] - point['y'], reverseLeft['x'] - point['x']));
        var angleReverseRight = toDegrees(Math.atan2(reverseRight['y'] - point['y'], reverseRight['x'] - point['x']));

        console.log(angleLeft - angleRight);

        if(angleLeft - angleRight > 180){
            console.log("use reverse");
        }else{
            console.log("use normal");
        }

        console.log(angleLeft, angleRight, angleReverseLeft, angleReverseRight);
        




        // var angleRadians = Math.atan2(left['y'] - point['y'], left['x'] - point['x']);
        // var leftAngle = toDegrees(angleRadians);
        // leftAngle = to_positive_angle(leftAngle);
        
        
        // angleRadians = Math.atan2(right['y'] - point['y'], right['x'] - point['x']);
        // var rightAngle = toDegrees(angleRadians);
        // rightAngle = to_positive_angle(rightAngle);
        

        // leftAngle = getOtherAngle(leftAngle);
        // rightAngle = getOtherAngle(rightAngle);
        
        // console.log("Selecting Between:", leftAngle, rightAngle);
        
        // var min = rightAngle > leftAngle ? leftAngle : rightAngle;
        // var max = rightAngle > leftAngle ? rightAngle : leftAngle;

        // var split = (min + max)/2;
        // var toAdd = Math.random() * (split * .25);

        // // selected angle to generate new crack
        // var selected = Math.random() > .5 ? split + toAdd : split - toAdd;
        // var selectedDistance = randomFromInterval(shatterLayerDistance/2, shatterLayerDistance);

        // console.log("Selected:", selected, "at distance", selectedDistance);

        // var riseAmnt = selectedDistance * Math.sin(toRadians(selected));
        // var slideAmnt = selectedDistance * Math.cos(toRadians(selected));

        // var new_y = point['y'] + riseAmnt;
        // var new_x = point['x'] + slideAmnt;
        // new_x = new_x > width ? width : new_x < -width ? -width : new_x;
        // new_y = new_y > height ? height : new_y < -height ? -height : new_y;


        

        // var mat = new THREE.LineBasicMaterial({color: 0xff0000});
        // var geo = new THREE.Geometry();
        // geo.vertices.push(
        //     new THREE.Vector3(point['x'], point['y'], .003),
        //     new THREE.Vector3(new_x, new_y, .003)
        // );
        // var line = new THREE.Line(geo, mat);
        // scene.add(line);
        
        
    }
    

    return layer;
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

function getOtherAngle(angle){
    console.log("Get Other for:", angle);
    if(angle < 180){
        return -(180 - angle);
    }else{
        return 180 - (360 - angle);
    }
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
