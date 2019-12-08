/*
window.$ = window.jQuery = require('jquery');
$("input[type='image']").click(function(event) {
    var elOffsetX = $(this).offset().left,
        elOffsetY = $(this).offset().top,
        clickOffsetX = event.pageX - elOffsetX,
        clickOffsetY = event.pageY - elOffsetY;

    $("body").append(" " + clickOffsetX + " " + clickOffsetY);

    event.preventDefault();
});
*/

// ZERO RPC SERVER
const zerorpc = require('zerorpc');
const electron = require('electron')
var remote = require('electron').remote;
let client = new zerorpc.Client();
client.connect("tcp://127.0.0.1:9999")
//mapHeight = require('./renderer-mainscreen').lengthPix
//mapWidth = widthPix;
var clicked = false
var img = new Image()
img.src="background.jpg"
var robot = new Image()
var robotFlipped = new Image()
var target = new Image()
target.src = "target.png"
robot.src = "robot.png"
robotFlipped.src = "robotflipped.png"

var legoRobo = new Image();
legoRobo.src = "robo-lego.png"
var legoOrNot = remote.getGlobal('infoVault').legoOrNot;

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
roboH = 225
roboW = 20
sizeX = 20
sizeY = 20 
var canvasHeight = 450 // in pixels
var canvasWidth = 800 // in pixels

var angleSlider = document.getElementById("angle");
var speedSlider = document.getElementById("speed");
//var canvasHeightToWorldRatio = (remote.getGlobal('infoVault').height)/canvasHeight;
//var canvasWidthToWorldRatio = (remote.getGlobal('infoVault').width)/canvasHeight;
//var canvasToWorldRatio = (remote.getGlobal('infoVault').height * removeEventListener.getGlobal('infoVault').width)/(canvasHeight * canvasWidth)
ctx.rect(roboH,roboW, sizeX, sizeY)
centreX = roboH+sizeY/2
centreY= roboW +sizeX/2 

var currRoboSpeed = 20
speedSlider.value = currRoboSpeed;
var options = document.querySelector("#optionsList")
img.onload = function() {
    draw(this);
};

var loaded = false
robot.onload = function() {
}
function draw(img) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(roboW, roboH)
    ctx.rotate(angle);
    //ctx.drawImage(legoRobo, roboW - legoRobo.width/2.0, roboH - legoRobo.height/2.0)
    ctx.drawImage(legoRobo, -(legoRobo.width/2), -(legoRobo.height/2))
    ctx.restore();
}



function log(event) {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var x = event.layerX;
    var y = event.layerY;
    console.log(x + " " + y);
    if(clicked){
        ctx.drawImage(robot, x, y)
    }
}

function moveRobo(e) {
    console.log("fired!")
    if (e.keyCode == 65) {
        if ((centreX + sizeX)<=799){
            roboW+=10;
        }
    }
    centreY = roboH+sizeY/2
    centreX= roboW +sizeX/2
    canvas.width=canvas.width
    draw(img)
    ctx.fillStyle = 'black';
    ctx.fillRect(roboW,roboH,50,50)
    ctx.stroke();
    console.log(centreX + " " + centreY)
}


var targetX = 0
var targetY = 0
var targetAngle = 0
var angle = 0
// Target was recently changed. Cancels any animating recursive functions.
var targetChanged = false
var animating = false
var heading = 0
var canvasHeightToWorldRatio = 0;
var canvasWidthToWorldRatio = 0;
//169.254.198.67
function sendRoboCommand(e) {
    if (!draggingMode){
        var x = e.offsetX;
        var y = e.offsetY;
        var canvasToWorldRatio = (remote.getGlobal('infoVault').height * remote.getGlobal('infoVault').width)/(canvasHeight * canvasWidth)
        canvasHeightToWorldRatio = (remote.getGlobal('infoVault').height)/canvasHeight;
        canvasWidthToWorldRatio = (remote.getGlobal('infoVault').width)/canvasWidth;
        //console.log(remote.getGlobal('infoVault').width + " by " + remote.getGlobal('infoVault').height + " with ip address" + remote.getGlobal("infoVault").ip )
        //console.log("X coords are " + x + " y coords are " + y)
        console.log("Initial angle is " + angle)
        var angleInRadians = Math.atan2((y-roboH) * canvasHeightToWorldRatio, (x-roboW) * canvasWidthToWorldRatio)
        var angleToTurn = (angleInRadians- angle) * (180/(Math.PI))
        heading=angleInRadians;
        var distToTravel = Math.sqrt(((x-roboW) * canvasWidthToWorldRatio)**2 + ((y-roboH) * canvasHeightToWorldRatio)**2) // pixel distance
        var actualDist = distToTravel
        console.log(y-roboH);
        console.log(x-roboW)
        console.log("Have to travel " + actualDist + " at an angle of " + angleToTurn)
        targetX = x
        targetY = y
        targetAngle = angleInRadians
        //console.log("TargetX is " + targetX + " and target Y is " + targetY);
        if (animating) {
            targetChanged = true
        } else {
            targetChanged = false
        }
        client.invoke("moveTo", remote.getGlobal("infoVault").ip, angleToTurn, distToTravel, currRoboSpeed, (error, res)=>{
            if (error) {
                console.log(error)
            } else {
                console.log("omg it worked")
            }
        })
        animate()
    }
    
 

}
// Target Spritesheet Animation Settings
var targetFrameIndex = 0
var targetHeightIndex = 0
var targetTickCount = 0
var ticksPerFrame = 2
var targetSizeX = 75
var targetSizeY = 50

// Robot Boy Spritesheet Animation Settings.
var robotFrameIndex = 0
var robotHeightIndex = 0
var robotTickCount = 0
var robotTicksPerFrame = 5
var robotSizeX = 60
var robotSizeY = 64

function animate() {
    var dx = 1
    var dy = 1
    var d_angle = 0.1
    animating = true
    if (targetChanged) {
        targetChanged = false
        animating = false
        return;
    }
    if (Math.round(roboW - targetX) != 0 || Math.round(roboH - targetY) !=0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        draw(img)
        ctx.fillStyle = 'black'
        dx = Math.sign(targetX - roboW) * (Math.abs(roboW-targetX))/800 * 20;
        dy = Math.sign(targetY - roboH) * (Math.abs(roboH-targetY))/450 * 20;
        d_angle = 0.01 * Math.sign(targetAngle);
        //targetAngle = Math.atan2((targetY-roboH), (targetX-roboW))
        //console.log("Current angle is " + angle + " and target is " + targetAngle)
        if (Math.abs(angle - targetAngle) > 0.05) {
            if (angle < targetAngle) {
                angle+=0.1
            } else if (angle > targetAngle) {
                angle-=0.1
            } else {
                angle+=d_angle
            }
        }
        //console.log("TargetX: " + targetX 
        //+ " TargetY: " + targetY + " x: " + roboW + " y: " + roboH);
        roboW+=dx
        roboH+=dy
        targetTickCount+=1
        if (targetTickCount > ticksPerFrame) {
            targetTickCount = 0;
            targetFrameIndex+=1
            if (targetFrameIndex > 5) {
                targetFrameIndex = 0
                targetHeightIndex+=1
                if (targetHeightIndex > 23) {
                    targetHeightIndex = 0
                }
            }
        }
        ctx.drawImage(target, targetFrameIndex * (1000/5), targetHeightIndex * (3600/24), (1000/5), (3600/24), targetX-(targetSizeX/2.0), targetY-(targetSizeY/2.0), targetSizeX, targetSizeY)
        if (legoOrNot) {
            //ctx.drawImage(legoRobo, roboW - legoRobo.width/2.0, roboH - legoRobo.height/2.0)
        } else {
            robotTickCount+=1
            if (robotTickCount > robotTicksPerFrame) {
                robotTickCount = 0;
                robotFrameIndex +=1;
                if (robotFrameIndex > 4) {
                    robotFrameIndex = 0
                    robotHeightIndex+=1
                    if (robotHeightIndex > 1) {
                        robotHeightIndex = 0
                    }
                }
            }
            console.log("Robot Frame Index is " + robotFrameIndex + " and the height index is " + robotHeightIndex)
            if (Math.sign(targetX - roboW) > 0) {
                ctx.drawImage(robot, robotFrameIndex * (641/5.0), robotHeightIndex * (403/2.0), 641/5.0, 403/2.0, roboW-(robotSizeX/2.0), roboH-(robotSizeY/2.0), robotSizeX, robotSizeY)
            } else {
                ctx.drawImage(robotFlipped, (4-robotFrameIndex) * (641/5.0), robotHeightIndex * (403/2.0), 641/5.0, 403/2.0, roboW-(robotSizeX/2.0), roboH-(robotSizeY/2.0), robotSizeX, robotSizeY)
            }
        }
    } else {
        //ctx.drawImage(robot, robotFrameIndex * (641/5.0), robotHeightIndex * (403/2.0), 641/5.0, 403/2.0, roboW-(robotSizeX/2.0), roboH-(robotSizeY/2.0), robotSizeX,robotSizeY)
        draw(img)
        animating = false
        return;
    }
    requestAnimationFrame(animate)
}

var isDragging = false
var draggingMode = false
function update() {
    ctx.clearRect(0, 0, innerWidth, innerHeight)
    draw(img)
    ctx.fillStyle = 'black'
    //ctx.drawImage(legoRobo, robotFrameIndex * (641/5.0), robotHeightIndex * (403/2.0), 641/5.0, 403/2.0, roboW, roboH, robotSizeX, robotSizeY)
}
startX = roboW
startY = roboH
function mouseDown(e) {
    if (draggingMode) {
        e.preventDefault()
        e.stopPropagation()
        console.log("MOUSE IS DOWN")
        var mx=parseInt(e.offsetX);
        var my=parseInt(e.offsetY);
        console.log("mx ")
        if (mx > roboW-legoRobo.width/2 && mx < roboW + legoRobo.width/2 && my > roboH-legoRobo.height/2 && my < roboH+legoRobo.height/2) {
            isDragging = true;
            console.log("draggin set to true")
        }
        startX=mx;
        startY=my;
    }
}

function mouseUp(e) {
    if (draggingMode) {
        e.preventDefault();
        e.stopPropagation();
        isDragging = false
    }
}

function mouseMove(e) {
    if (isDragging && draggingMode) {
        console.log("Draggin!")
        e.preventDefault();
        e.stopPropagation();
        var mx=parseInt(e.offsetX);
        var my=parseInt(e.offsetY);
        var dx=mx-startX;
        var dy=my-startY;
        roboW+=dx;
        roboH+=dy;
        update();
        startX=mx;
        startY=my;
    }
}

var driveButton = document.querySelector("#driveButton");
var dragButton = document.querySelector("#dragButton");

function selectOption(e) {
    console.log("INSIDE HERE")
    console.log(e)
    if (document.querySelector('#optionsList li.is-active') !== null) {
      document.querySelector('#optionsList li.is-active').classList.remove('active');
    } else if (document.querySelector('#optionsList li') !== null) {
        console.log("Recognised! yeet")
    }
    console.log(e.target)
    e.target.className = "is-active";
  }


canvas.addEventListener('click', sendRoboCommand)
canvas.addEventListener('mousedown', mouseDown)
canvas.addEventListener('mouseup', mouseUp)
canvas.addEventListener('mousemove', mouseMove)
update();


options.addEventListener('click',selectOption)
driveButton.addEventListener('click',function() {
    draggingMode = false;
    driveButton.classList = "is-active"
    dragButton.classList.remove("is-active")
    console.log("Drive Button CLicked!");
})
dragButton.addEventListener('click',function() {
    draggingMode = true;
    dragButton.classList = "is-active"
    driveButton.classList.remove("is-active")
    console.log("Drag Button Pressed")
})


angleSlider.addEventListener('input', function() {
    console.log("Detected Angle Change")
    angle = parseFloat(this.value)
    draw(img)
})

speedSlider.addEventListener('input', function(){
        console.log("Detected Speed Change")
        currRoboSpeed = parseInt(this.value)
        
    })

/*
canvas.addEventListener('mousedown', function(){
})
canvas.addEventListener('mouseup', function(){
    clicked = false
})
*/
//canvas.addEventListener('mousemove', log);
