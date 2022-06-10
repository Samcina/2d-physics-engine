let mode = "MOVE";
let MOUSE_CLICKS = [];
let running = true;

function userInput(){
    canvas.addEventListener('keydown', function(e){
        if(e.code === "KeyA"){
            left = true;
        }
        if(e.code === "KeyW"){
            up = true;
        }
        if(e.code === "KeyD"){
            right = true;
        }
        if(e.code === "KeyS"){
            down = true;
        }
        if(e.code === "KeyQ"){
            rotLeft = true;
        }
        if(e.code === "KeyE"){
            rotRight = true;
        }
        if(e.code === "Space"){
            action = true;
        }
    });
    
    canvas.addEventListener('keyup', function(e){
        if(e.code === "KeyA"){
            left = false;
        }
        if(e.code === "KeyW"){
            up = false;
        }
        if(e.code === "KeyD"){
            right = false;
        }
        if(e.code === "KeyS"){
            down = false;
        }
        if(e.code === "KeyQ"){
            rotLeft = false;
        }
        if(e.code === "KeyE"){
            rotRight = false;
        }
        if(e.code === "Space"){
            action = false;
        }
    });    
}


// Helper function to get an element's exact position
function getPosition(el) {
    let xPos = 0;
    let yPos = 0;
   
    while (el) {
      if (el.tagName == "BODY") {
        // deal with browser quirks with body/window/document and page scroll
        let xScroll = el.scrollLeft || document.documentElement.scrollLeft;
        let yScroll = el.scrollTop || document.documentElement.scrollTop;
   
        xPos += (el.offsetLeft - xScroll + el.clientLeft);
        yPos += (el.offsetTop - yScroll + el.clientTop);
      } else {
        // for all other non-BODY elements
        xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
        yPos += (el.offsetTop - el.scrollTop + el.clientTop);
      }
  
      el = el.offsetParent;
    }
    return {
      x: xPos,
      y: yPos
    };
  }
  

function collideTimer() {
    clickCollide = false;
}

let canvasPosition = getPosition(canvas);
 
canvas.addEventListener("click", doSomething, false);
userInput();
// take into account page scrolls and resizes
window.addEventListener("scroll", updatePosition, false);
window.addEventListener("resize", updatePosition, false);
 
function updatePosition() {
  canvasPosition = getPosition(canvas);
}
 
function doSomething(e) {
  // get the exact mouse X and Y coordinates
    let mouseX = e.clientX - canvasPosition.x;
    let mouseY = e.clientY - canvasPosition.y;

    if(mode === "MOVE") {
        let clickBall = new Ball(mouseX, mouseY, 5, 0);
        let found = false;
        BODIES.forEach((b, index) => {
            if(collide(b, BODIES[BODIES.indexOf(clickBall)]) != false && found === false) {
                BODIES[index].player = true;
                found = true;
        }
        else {
            BODIES[index].player = false;
        }
        });
        clickBall.remove();
    }

    if(mode === "DELETE") {
        let clickBall = new Ball(mouseX, mouseY, 5, 0);
        let found = false;
        let object;
        BODIES.forEach((b, index) => {
            if(collide(b, BODIES[BODIES.indexOf(clickBall)]) != false && found === false) {
                object = b;
                found = true;
        }
        });
        clickBall.remove();
        if(found)
            object.remove();
    }

    if(mode === "BALL") {
        let radiusSlider = document.getElementById("radiusRange");
        let massSlider = document.getElementById("massRange");
        let color = document.getElementById("color");
        let clickBall = new Ball(mouseX, mouseY, radiusSlider.value, massSlider.value, color.value);
        let found = false;
        BODIES.forEach((b, index) => {
            if(collide(b, BODIES[BODIES.indexOf(clickBall)]) != false && index != BODIES.indexOf(clickBall)) {
                found = true;
            }
        });
        if(found === true){
            clickBall.remove();
            clickCollide = true;
            setTimeout(collideTimer, 1000);
            console.log("Object is colliding with another object")
        }
        
    }

    if(mode === "CAPSULE") {
        let radiusSlider = document.getElementById("radiusRange");
        let widthSlider = document.getElementById("widthRange");
        let massSlider = document.getElementById("massRange");
        let color = document.getElementById("color");
        let clickCapsule = new Capsule(mouseX - (widthSlider.value/2), mouseY, mouseX + (widthSlider.value/2), mouseY, radiusSlider.value, massSlider.value, color.value);
        let found = false;
        BODIES.forEach((b, index) => {
            if(collide(b, BODIES[BODIES.indexOf(clickCapsule)]) != false && index != BODIES.indexOf(clickCapsule)) {
                found = true;
            }
        });
        if(found === true){
            clickCapsule.remove();
            clickCollide = true;
            setTimeout(collideTimer, 1000);
            console.log("Object is colliding with another object")
        }
        
    }

    if(mode === "BOX") {
        let widthSlider = document.getElementById("widthRange");
        let heightSlider = document.getElementById("heightRange");
        let massSlider = document.getElementById("massRange");
        let color = document.getElementById("color");
        let clickBox = new Box(mouseX - (widthSlider.value/2), mouseY, mouseX + (widthSlider.value/2), mouseY, heightSlider.value, massSlider.value, color.value);
        let found = false;
        BODIES.forEach((b, index) => {
            if(collide(b, BODIES[BODIES.indexOf(clickBox)]) != false && index != BODIES.indexOf(clickBox)) {
                found = true;
            }
        });
        if(found === true){
            clickBox.remove();
            clickCollide = true;
            setTimeout(collideTimer, 1000);
            console.log("Object is colliding with another object")
        }
        
    }

    if(mode === "TRIANGLE") {
        if(MOUSE_CLICKS.length <= 1) {
            MOUSE_CLICKS.push(new Vector(mouseX, mouseY));
        }
        else {
            let massSlider = document.getElementById("massRange");
            let color = document.getElementById("color");
            let clickTriangle = new TriangleBody(MOUSE_CLICKS[0].x, MOUSE_CLICKS[0].y, MOUSE_CLICKS[1].x, MOUSE_CLICKS[1].y, mouseX, mouseY, massSlider.value, color.value);
            let found = false;
            BODIES.forEach((b, index) => {
                if(collide(b, BODIES[BODIES.indexOf(clickTriangle)]) != false && index != BODIES.indexOf(clickTriangle)) {
                    found = true;
                }
            });
            if(found === true){
                clickTriangle.remove();
                clickCollide = true;
                setTimeout(collideTimer, 1000);
                console.log("Object is colliding with another object")
            }
            MOUSE_CLICKS = [];
        }

    }

    if(mode === "STAR") {
        let radiusSlider = document.getElementById("radiusRange");
        let massSlider = document.getElementById("massRange");
        let color = document.getElementById("color");
        let clickStar = new Star(mouseX, mouseY, radiusSlider.value, massSlider.value, color.value);
        let found = false;
        BODIES.forEach((b, index) => {
            if(collide(b, BODIES[BODIES.indexOf(clickStar)]) != false && index != BODIES.indexOf(clickStar)) {
                found = true;
            }
        });
        if(found === true){
            clickStar.remove();
            clickCollide = true;
            setTimeout(collideTimer, 1000);
            console.log("Object is colliding with another object")
        }
        
    }

    if(mode === "WALL") {
        if(MOUSE_CLICKS.length == 0) {
            MOUSE_CLICKS.push(new Vector(mouseX, mouseY));
        }
        else {
            let clickWall = new Wall(mouseX, mouseY, MOUSE_CLICKS[0].x, MOUSE_CLICKS[0].y);
            let found = false;
            BODIES.forEach((b, index) => {
                if(collide(b, BODIES[BODIES.indexOf(clickWall)]) != false && index != BODIES.indexOf(clickWall)) {
                    found = true;
                }
            });
            if(found === true){
                clickWall.remove();
                clickCollide = true;
                setTimeout(collideTimer, 1000);
                console.log("Object is colliding with another object")
            }
            MOUSE_CLICKS = [];
        }

    }

}

let radiusContainer = document.getElementById("radiusContainer");
let radiusSlider = document.getElementById("radiusRange");
let radiusOutput = document.getElementById("radius");
radiusOutput.innerHTML = radiusSlider.value;

radiusSlider.oninput = function() {
    radiusOutput.innerHTML = this.value;
}

let widthContainer = document.getElementById("widthContainer");
let widthSlider = document.getElementById("widthRange");
let widthOutput = document.getElementById("width");
widthOutput.innerHTML = widthSlider.value;

widthSlider.oninput = function() {
    widthOutput.innerHTML = this.value;
}

let heightContainer = document.getElementById("heightContainer");
let heightSlider = document.getElementById("heightRange");
let heightOutput = document.getElementById("height");
heightOutput.innerHTML = heightSlider.value;

heightSlider.oninput = function() {
    heightOutput.innerHTML = this.value;
}

let massContainer = document.getElementById("massContainer");
let massSlider = document.getElementById("massRange");
let massOutput = document.getElementById("mass");
massOutput.innerHTML = massSlider.value;

massSlider.oninput = function() {
    massOutput.innerHTML = this.value;
}

let colorContainer = document.getElementById("colorContainer");

function clearPlayer(){
    BODIES.forEach((b, index) => {
        BODIES[index].player = false;
    });
}

function clickMove(){
    clearPlayer();
    radiusContainer.hidden = true;
    widthContainer.hidden = true;
    heightContainer.hidden = true;
    massContainer.hidden = true;
    colorContainer.hidden = true;

    mode = "MOVE";
    console.log("Mode changed");
}

function clickDelete(){
    clearPlayer();
    radiusContainer.hidden = true;
    widthContainer.hidden = true;
    heightContainer.hidden = true;
    massContainer.hidden = true;
    colorContainer.hidden = true;
    mode = "DELETE";
    console.log("Mode changed");
}

function clickBall(){
    clearPlayer();
    radiusContainer.hidden = false;
    widthContainer.hidden = true;
    heightContainer.hidden = true;
    massContainer.hidden = false;
    colorContainer.hidden = false;
    mode = "BALL";
    console.log("Mode changed");
}

function clickCapsule(){
    clearPlayer();
    radiusContainer.hidden = false;
    widthContainer.hidden = false;
    heightContainer.hidden = true;
    massContainer.hidden = false;
    colorContainer.hidden = false;
    mode = "CAPSULE";
    console.log("Mode changed");
}

function clickBox(){
    clearPlayer();
    radiusContainer.hidden = true;
    widthContainer.hidden = false;
    heightContainer.hidden = false;
    massContainer.hidden = false;
    colorContainer.hidden = false;
    mode = "BOX";
    console.log("Mode changed");
}

function clickTriangle(){
    clearPlayer();
    MOUSE_CLICKS = [];
    radiusContainer.hidden = true;
    widthContainer.hidden = true;
    heightContainer.hidden = true;
    massContainer.hidden = false;
    colorContainer.hidden = false;
    mode = "TRIANGLE";
    console.log("Mode changed");
}

function clickStar(){
    clearPlayer();
    radiusContainer.hidden = false;
    widthContainer.hidden = true;
    heightContainer.hidden = true;
    massContainer.hidden = false;
    colorContainer.hidden = false;
    mode = "STAR";
    console.log("Mode changed");
}

function clickWall(){
    clearPlayer();
    MOUSE_CLICKS = [];
    radiusContainer.hidden = true;
    widthContainer.hidden = true;
    heightContainer.hidden = true;
    massContainer.hidden = true;
    colorContainer.hidden = true;
    mode = "WALL";
    console.log("Mode changed");
}

function clickGravity(){
    clearPlayer();
    if(toggleGravity === true){
        toggleGravity = false;
    }
    else if(toggleGravity === false){
        toggleGravity = true;
    }
    console.log("Gravity changed");
}

function pause(){
    clearPlayer();
    if(running === true){
        running = false;
        fc.pause();
        console.log("Simulation paused");
    }
    else if(running === false){
        running = true;
        fc.start();
        console.log("Simulation started");
    }
    
}