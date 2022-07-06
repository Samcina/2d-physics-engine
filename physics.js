const BODIES = [];
const COLLISIONS = [];

let width=640;
let height=480;
let render = 0;

let left = false;
let right = false;
let up = false;
let down = false;
let rotLeft = false;
let rotRight = false;
let action = false;
let toggleGravity = true;
let clickCollide = false;

// Vector class with operations
class Vector{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }  
   
    set(x, y){
        this.x = x;
        this.y = y;
    }

    add(v){
        return new Vector(this.x+v.x, this.y+v.y);
    }

    subtr(v){
        return new Vector(this.x-v.x, this.y-v.y);
    }

    mag(){
        return Math.sqrt(this.x**2 + this.y**2);
    }

    mult(n){
        return new Vector(this.x*n, this.y*n);
    }

    normal(){
        return new Vector(-this.y, this.x).unit();
    }

    unit(){
        if(this.mag() === 0){
            return new Vector(0,0);
        } else {
            return new Vector(this.x/this.mag(), this.y/this.mag());
        }
    }

    drawVec(start_x, start_y, n, color){
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(start_x + this.x * n, start_y + this.y * n);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    }
    
    static dot(v1, v2){
        return v1.x*v2.x + v1.y*v2.y;
    }

    static cross(v1, v2){
        return v1.x*v2.y - v1.y*v2.x;
    }
}

// Matrix class with operations
class Matrix{
    constructor(rows, cols){
        this.rows = rows;
        this.cols = cols;
        this.data = [];

        for (let i = 0; i<this.rows; i++){
            this.data[i] = [];
            for (let j=0; j<this.cols; j++){
                this.data[i][j] = 0;
            }
        }
    }

    multiplyVec(vec){
        let result = new Vector(0,0);
        result.x = this.data[0][0]*vec.x + this.data[0][1]*vec.y;
        result.y = this.data[1][0]*vec.x + this.data[1][1]*vec.y;
        return result;
    }

    rotMx22(angle){
        this.data[0][0] = Math.cos(angle);
        this.data[0][1] = -Math.sin(angle);
        this.data[1][0] = Math.sin(angle);
        this.data[1][1] = Math.cos(angle);
    }
}

// primitive shapes

// primitive Line shape
class Line {
    constructor(x0, y0, x1, y1, color = "black") {
        this.color = color;
        this.vertices = [];
        this.vertices[0] = new Vector(x0, y0);
        this.vertices[1] = new Vector(x1, y1);
        this.position = new Vector((this.vertices[0].x+this.vertices[1].x)/2, (this.vertices[0].y+this.vertices[1].y)/2);
        this.direction = this.vertices[1].subtr(this.vertices[0]).unit();
        this.magnitude = this.vertices[1].subtr(this.vertices[0]).mag();
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        ctx.lineTo(this.vertices[1].x, this.vertices[1].y);
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.strokeStyle = "";
        ctx.closePath();
    }
}

// primitive Circle shape
class Circle {
    constructor(x, y, r, color = "red") {
        this.color = color;
        this.vertices = [];
        this.position = new Vector(x, y);
        this.r = r;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.r, 0, 2*Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.fillStyle = "";
        ctx.closePath();
    }
}

// primitive Rectangle shape
class Rectangle{
    constructor(x1, y1, x2, y2, w, color = "blue"){
        this.color = color;
        this.vertices = [];
        this.vertices[0] = new Vector(x1, y1);
        this.vertices[1] = new Vector(x2, y2);
        this.direction = this.vertices[1].subtr(this.vertices[0]).unit();
        this.refDirection = this.vertices[1].subtr(this.vertices[0]).unit();
        this.length = this.vertices[1].subtr(this.vertices[0]).mag();
        this.width = w;
        this.vertices[2] = this.vertices[1].add(this.direction.normal().mult(this.width));
        this.vertices[3] = this.vertices[2].add(this.direction.mult(-this.length));
        this.position = this.vertices[0].add(this.direction.mult(this.length/2)).add(this.direction.normal().mult(this.width/2));
        this.angle = 0;
        this.rotMat = new Matrix(2,2);
    }

    draw(){
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        ctx.lineTo(this.vertices[1].x, this.vertices[1].y);
        ctx.lineTo(this.vertices[2].x, this.vertices[2].y);
        ctx.lineTo(this.vertices[3].x, this.vertices[3].y);
        ctx.lineTo(this.vertices[0].x, this.vertices[0].y);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.fillStyle = "";
        ctx.closePath();
    }

    getVertices(angle){
        this.rotMat.rotMx22(angle);
        this.direction = this.rotMat.multiplyVec(this.refDirection);
        this.vertices[0] = this.position.add(this.direction.mult(-this.length/2)).add(this.direction.normal().mult(this.width/2));
        this.vertices[1] = this.position.add(this.direction.mult(-this.length/2)).add(this.direction.normal().mult(-this.width/2));
        this.vertices[2] = this.position.add(this.direction.mult(this.length/2)).add(this.direction.normal().mult(-this.width/2));
        this.vertices[3] = this.position.add(this.direction.mult(this.length/2)).add(this.direction.normal().mult(this.width/2));
    }
}

// primitive Triangle shape
class Triangle{
    constructor(x1, y1, x2, y2, x3, y3, color = "yellow"){
        this.color = color;
        this.vertices = [];
        this.vertices[0] = new Vector(x1, y1);
        this.vertices[1] = new Vector(x2, y2);
        this.vertices[2] = new Vector(x3, y3);
        this.position = new Vector((this.vertices[0].x+this.vertices[1].x+this.vertices[2].x)/3, (this.vertices[0].y+this.vertices[1].y+this.vertices[2].y)/3);
        this.direction = this.vertices[0].subtr(this.position).unit();
        this.refDirection = this.direction;
        this.refDiameter = [];
        this.refDiameter[0] = this.vertices[0].subtr(this.position);
        this.refDiameter[1] = this.vertices[1].subtr(this.position);
        this.refDiameter[2] = this.vertices[2].subtr(this.position);
        this.angle = 0;
        this.rotMat = new Matrix(2,2);
    }

    draw(){
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        ctx.lineTo(this.vertices[1].x, this.vertices[1].y);
        ctx.lineTo(this.vertices[2].x, this.vertices[2].y);
        ctx.lineTo(this.vertices[0].x, this.vertices[0].y);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.fillStyle = "";
        ctx.closePath();
    }

    getVertices(angle){
        this.rotMat.rotMx22(angle);
        this.direction = this.rotMat.multiplyVec(this.refDirection);
        this.vertices[0] = this.position.add(this.rotMat.multiplyVec(this.refDiameter[0]));
        this.vertices[1] = this.position.add(this.rotMat.multiplyVec(this.refDiameter[1]));
        this.vertices[2] = this.position.add(this.rotMat.multiplyVec(this.refDiameter[2]));
    }
}

// parent Body class
class Body {
    constructor(x, y) {
        this.components = [];
        this.position = new Vector(x, y);
        //physics constants
        this.mass = 0;
        this.inv_mass = 0;
        this.inertia = 0;
        this.inv_inertia = 0;
        this.elasticity = 0.4;

        this.friction = 0.01;
        this.angFriction = 0.01;
        this.maxSpeed = 0;
        this.color = "";

        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.keyForce = 0.4;
        this.angKeyForce = 0.1;
        this.angle = 0;
        this.angVelocity = 0;
        this.gravity = 0.001;
        this.player = false;

        //add to array
        BODIES.push(this);
    }

    render(){
        if(this.color){
            this.setColor(this.color)
        }
        for (let i in this.components){
            this.components[i].draw();
        }
    }

    setColor(color){
        this.components.forEach(components => {
            components.color = color
        })
    }

    reposition(substeps){
        this.acceleration = this.acceleration.unit().mult(this.keyForce);
        this.velocity = this.velocity.add(this.acceleration.mult(1/substeps));
        this.velocity = this.velocity.mult(1-(this.friction * (1/substeps)));
        if (this.velocity.mag() > this.maxSpeed && this.maxSpeed !== 0){
            this.velocity = this.velocity.unit().mult(this.maxSpeed);
        }
        this.angVelocity *= (1-(this.angFriction * (1/substeps)));
    }
    keyControl(){}
    remove(){
        if (BODIES.indexOf(this) !== -1){
            BODIES.splice(BODIES.indexOf(this), 1);
        }
    }
    checkBounds(){
        if(this.position.x > width) {
            this.position.x = width;
        }
        if(this.position.x < 0) {
            this.position.x = 0;
        }
        if(this.position.y > height) {
            this.position.y = height;
        }
        if(this.position.y < 0) {
            this.position.y = 0;
        }
    }
}

class Ball extends Body{
    constructor(x, y, r, m, color = "Red"){
        super();
        this.position = new Vector(x, y);
        this.components = [new Circle(x, y, r, color)];
        this.mass = m * r**2 * Math.PI;
        if (this.mass === 0){
            this.inv_mass = 0;
        } else {
            this.inv_mass = 1 / this.mass;
        }
    }

    setPosition(x, y, a = this.angle){
        this.position.set(x, y);
        this.components[0].position = this.position;
    }

    reposition(substeps){
        super.reposition(substeps);
        this.setPosition(this.position.add(this.velocity.mult(1/substeps)).x, this.position.add(this.velocity.mult(1/substeps)).y);
        super.checkBounds();
    }

    keyControl(){
        this.acceleration.x = 0;
        this.acceleration.y = this.gravity;
        if(toggleGravity === false){
            this.acceleration.y = 0;
        } 
        if(left && this.player){
            this.acceleration.x -= this.keyForce;
        }
        if(up && this.player){
            this.acceleration.y -= this.keyForce;
        }
        if(right && this.player){
            this.acceleration.x += this.keyForce;
        }
        if(down && this.player){
            this.acceleration.y += this.keyForce;
        }
    }
}

class Wall extends Body{
    constructor(x1, y1, x2, y2){
        super();
        this.start = new Vector(x1, y1);
        this.end = new Vector(x2, y2);
        this.components = [new Line(x1, y1, x2, y2)];
        this.direction = this.end.subtr(this.start).unit();
        this.position = new Vector((x1+x2)/2, (y1+y2)/2);
    }
}

class Capsule extends Body{
    constructor(x1, y1, x2, y2, r, m, color = "blue"){
        super();
        this.color = color;
        this.components = [new Circle(x1, y1, r, color), new Circle(x2, y2, r, color)];
        let recV1 = this.components[1].position.add(this.components[1].position.subtr(this.components[0].position).unit().normal().mult(r));
        let recV2 = this.components[0].position.add(this.components[1].position.subtr(this.components[0].position).unit().normal().mult(r));
        this.components.unshift(new Rectangle(recV1.x, recV1.y, recV2.x, recV2.y, 2*r, color));
        this.position = this.components[0].position;
        this.mass = m * (r**2 * Math.PI + this.components[0].width * this.components[0].length);
        if (this.mass === 0){
            this.inv_mass = 0;
        } else {
            this.inv_mass = 1 / this.mass;
        }
        this.inertia = this.mass * ((2*this.components[0].width)**2 +(this.components[0].length+2*this.components[0].width)**2) / 12;
        if (this.mass === 0){
            this.inv_inertia = 0;
        } else {
            this.inv_inertia = 1 / this.inertia;
        }
    }

    keyControl(){
        this.acceleration.x = 0;
        this.acceleration.y = this.gravity;
        if(toggleGravity === false){
            this.acceleration.y = 0;
        } 
        if(left && this.player){
            this.acceleration.x -= this.keyForce;
        }
        if(up && this.player){
            this.acceleration.y -= this.keyForce;
        }
        if(right && this.player){
            this.acceleration.x += this.keyForce;
        }
        if(down && this.player){
            this.acceleration.y += this.keyForce;
        }
        if(rotLeft && this.player){
            this.angVelocity = -this.angKeyForce;
        }
        if(rotRight && this.player){
            this.angVelocity = this.angKeyForce;
        }
    }

    setPosition(x, y, substeps, a = this.angle){
        this.position.set(x, y);
        this.angle = a;
        this.components[0].position = this.position;
        this.components[0].getVertices(this.angle + this.angVelocity * (1/substeps));
        this.components[1].position = this.components[0].position.add(this.components[0].direction.mult(-this.components[0].length/2));
        this.components[2].position = this.components[0].position.add(this.components[0].direction.mult(this.components[0].length/2));
        this.angle += this.angVelocity * (1/substeps);
    }

    reposition(substeps){
        super.reposition(substeps);
        this.setPosition(this.position.add(this.velocity.mult(1/substeps)).x, this.position.add(this.velocity.mult(1/substeps)).y, substeps);
        super.checkBounds();
    }
}

class Box extends Body{
    constructor(x1, y1, x2, y2, w, m, color = "yellow"){
        super();
        this.components = [new Rectangle(x1, y1, x2, y2, w, color)];
        this.position = this.components[0].position;
        this.mass = m * this.components[0].width * this.components[0].length;
        if (this.mass === 0){
            this.inv_mass = 0;
        } else {
            this.inv_mass = 1 / this.mass;
        }
        this.inertia = this.mass * (this.components[0].width**2 +this.components[0].length**2) / 12;
        if (this.mass === 0){
            this.inv_inertia = 0;
        } else {
            this.inv_inertia = 1 / this.inertia;
        }
    }

    keyControl(){
        this.acceleration.x = 0;
        this.acceleration.y = this.gravity;
        if(toggleGravity === false){
            this.acceleration.y = 0;
        } 
        if(left && this.player){
            this.acceleration.x -= this.keyForce;
        }
        if(up && this.player){
            this.acceleration.y -= this.keyForce;
        }
        if(right && this.player){
            this.acceleration.x += this.keyForce;
        }
        if(down && this.player){
            this.acceleration.y += this.keyForce;
        }
        if(rotLeft && this.player){
            this.angVelocity = -this.angKeyForce;
        }
        if(rotRight && this.player){
            this.angVelocity = this.angKeyForce;
        }
    }

    setPosition(x, y, substeps, a = this.angle){
        this.position.set(x, y);
        this.angle = a;
        this.components[0].position = this.position;
        this.components[0].getVertices(this.angle + this.angVelocity * (1/substeps));
        this.angle += this.angVelocity * (1/substeps);
    }

    reposition(substeps){
        super.reposition(substeps);
        this.setPosition(this.position.add(this.velocity.mult(1/substeps)).x, this.position.add(this.velocity.mult(1/substeps)).y, substeps);
        super.checkBounds();
    }
}

class Star extends Body{
    constructor(x1, y1, r, m, color = "orange"){
        super();
        this.components = [];
        this.r = r;
        let center = new Vector(x1, y1);
        let upDir = new Vector(0, -1);
        let p1 = center.add(upDir.mult(r));
        let p2 = center.add(upDir.mult(-r/2)).add(upDir.normal().mult(-r*Math.sqrt(3)/2));
        let p3 = center.add(upDir.mult(-r/2)).add(upDir.normal().mult(r*Math.sqrt(3)/2));
        this.components.push(new Triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, color));
        p1 = center.add(upDir.mult(-r));
        p2 = center.add(upDir.mult(r/2)).add(upDir.normal().mult(-r*Math.sqrt(3)/2));
        p3 = center.add(upDir.mult(r/2)).add(upDir.normal().mult(r*Math.sqrt(3)/2));
        this.components.push(new Triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, color));
        this.position = this.components[0].position;
        
        this.mass = m * r**2 * Math.sqrt(3);
        if (this.mass === 0){
            this.inv_mass = 0;
        } else {
            this.inv_mass = 1 / this.mass;
        }
        this.inertia = this.mass * ((2*this.r)**2) / 12;
        if (this.mass === 0){
            this.inv_inertia = 0;
        } else {
            this.inv_inertia = 1 / this.inertia;
        }
    }

    keyControl(){
        this.acceleration.x = 0;
        this.acceleration.y = this.gravity;
        if(toggleGravity === false){
            this.acceleration.y = 0;
        } 
        if(left && this.player){
            this.acceleration.x -= this.keyForce;
        }
        if(up && this.player){
            this.acceleration.y -= this.keyForce;
        }
        if(right && this.player){
            this.acceleration.x += this.keyForce;
        }
        if(down && this.player){
            this.acceleration.y += this.keyForce;
        }
        if(rotLeft && this.player){
            this.angVelocity = -this.angKeyForce;
        }
        if(rotRight && this.player){
            this.angVelocity = this.angKeyForce;
        }
    }

    setPosition(x, y, substeps,a = this.angle){
        this.position.set(x, y);
        this.angle = a;
        this.components[0].position = this.position;
        this.components[1].position = this.position;
        this.components[0].getVertices(this.angle + this.angVelocity * (1/substeps));
        this.components[1].getVertices(this.angle + this.angVelocity * (1/substeps));
        this.angle += this.angVelocity * (1/substeps);
    }

    reposition(substeps){
        super.reposition(substeps);
        this.setPosition(this.position.add(this.velocity.mult(1/substeps)).x, this.position.add(this.velocity.mult(1/substeps)).y, substeps);
        super.checkBounds();
   }
}

class TriangleBody extends Body {
    constructor(x1, y1, x2, y2, x3, y3, m, color = "purple"){
        super();
        this.components = [];
        this.components.push(new Triangle(x1, y1, x2, y2, x3, y3, color));
        this.position = this.components[0].position;
        this.area = Math.abs(Vector.cross(new Vector(x2-x1, y2-y1), new Vector(x3-x1, y3-y1))/2);
        this.mass = m * this.area;
        if (this.mass === 0){
            this.inv_mass = 0;
        } else {
            this.inv_mass = 1 / this.mass;
        }
        
        this.inertia = this.mass * (4*this.area) / 12;
        if (this.mass === 0){
            this.inv_inertia = 0;
        } else {
            this.inv_inertia = 1 / this.inertia;
        }
    }

    keyControl(){
        this.acceleration.x = 0;
        this.acceleration.y = this.gravity;
        if(toggleGravity === false){
            this.acceleration.y = 0;
        } 
        if(left && this.player){
            this.acceleration.x -= this.keyForce;
        }
        if(up && this.player){
            this.acceleration.y -= this.keyForce;
        }
        if(right && this.player){
            this.acceleration.x += this.keyForce;
        }
        if(down && this.player){
            this.acceleration.y += this.keyForce;
        }
        if(rotLeft && this.player){
            this.angVelocity = -this.angKeyForce;
        }
        if(rotRight && this.player){
            this.angVelocity = this.angKeyForce;
        }
    }

    setPosition(x, y, substeps, a = this.angle){
        this.position.set(x, y);
        this.angle = a;
        this.components[0].position = this.position;
        this.components[0].getVertices(this.angle + this.angVelocity * (1/substeps));
        this.angle += this.angVelocity * (1/substeps);
    }

    reposition(substeps){
        super.reposition(substeps);
        this.setPosition(this.position.add(this.velocity.mult(1/substeps)).x, this.position.add(this.velocity.mult(1/substeps)).y, substeps);
        super.checkBounds();
        
   }
}



//Collision manifold, consisting the data for collision handling
//Manifolds are collected in an array for every frame
class CollData{
    constructor(o1, o2, normal, pen, cp){
        this.o1 = o1;
        this.o2 = o2;
        this.normal = normal;
        this.pen = pen;
        this.cp = cp;
    }

    penRes(){
        let penResolution = this.normal.mult(this.pen / (this.o1.inv_mass + this.o2.inv_mass));
        this.o1.position = this.o1.position.add(penResolution.mult(this.o1.inv_mass * 1.01));
        this.o2.position = this.o2.position.add(penResolution.mult(-this.o2.inv_mass * 1.01));
        this.o1.checkBounds();
        this.o2.checkBounds();
    }

    collRes(){

        let collArm1 = this.cp.subtr(this.o1.components[0].position);
        let rotVel1 = new Vector(-this.o1.angVelocity * collArm1.y, this.o1.angVelocity * collArm1.x);
        let closVel1 = this.o1.velocity.add(rotVel1);
        let collArm2 = this.cp.subtr(this.o2.components[0].position);
        let rotVel2= new Vector(-this.o2.angVelocity * collArm2.y, this.o2.angVelocity * collArm2.x);
        let closVel2 = this.o2.velocity.add(rotVel2);

        let impAug1 = Vector.cross(collArm1, this.normal);
        impAug1 = impAug1 * this.o1.inv_inertia * impAug1;
        let impAug2 = Vector.cross(collArm2, this.normal);
        impAug2 = impAug2 * this.o2.inv_inertia * impAug2;

        let relVel = closVel1.subtr(closVel2);
        let sepVel = Vector.dot(relVel, this.normal);
        let new_sepVel = -sepVel * Math.min(this.o1.elasticity, this.o2.elasticity);
        let vsep_diff = new_sepVel - sepVel;

        let impulse = vsep_diff / (this.o1.inv_mass + this.o2.inv_mass + impAug1 + impAug2);
        let impulseVec = this.normal.mult(impulse);

        this.o1.velocity = this.o1.velocity.add(impulseVec.mult(this.o1.inv_mass));
        this.o2.velocity = this.o2.velocity.add(impulseVec.mult(-this.o2.inv_mass));

        this.o1.angVelocity += this.o1.inv_inertia * Vector.cross(collArm1, impulseVec);
        this.o2.angVelocity -= this.o2.inv_inertia * Vector.cross(collArm2, impulseVec); 
    }
}

//Separating axis theorem on two objects
//Returns with the details of the Minimum Translation Vector (or false if no collision)
function sat(o1, o2){
    let minOverlap = null;
    let smallestAxis;
    let vertexObj;

    let axes = findAxes(o1, o2);
    let proj1, proj2 = 0;
    let firstShapeAxes = getShapeAxes(o1);

    for(let i=0; i<axes.length; i++){
        proj1 = projShapeOntoAxis(axes[i], o1);
        proj2 = projShapeOntoAxis(axes[i], o2);
        let overlap = Math.min(proj1.max, proj2.max) - Math.max(proj1.min, proj2.min);
        if (overlap < 0){
            return false;
        }

        if((proj1.max > proj2.max && proj1.min < proj2.min) ||
          (proj1.max < proj2.max && proj1.min > proj2.min)){
              let mins = Math.abs(proj1.min - proj2.min);
              let maxs = Math.abs(proj1.max - proj2.max);
              if (mins < maxs){
                  overlap += mins;
              } else {
                  overlap += maxs;
                  axes[i] = axes[i].mult(-1);
              }
          }

        if (overlap < minOverlap || minOverlap === null){
            minOverlap = overlap;
            smallestAxis = axes[i];
            if (i<firstShapeAxes){
                vertexObj = o2;
                if(proj1.max > proj2.max){
                    smallestAxis = axes[i].mult(-1);
                }
            } else {
                vertexObj = o1;
                if(proj1.max < proj2.max){
                    smallestAxis = axes[i].mult(-1);
                }
            }
        }  
    };

    let contactVertex = projShapeOntoAxis(smallestAxis, vertexObj).collVertex;

    if(vertexObj === o2){
        smallestAxis = smallestAxis.mult(-1);
    }

    return {
        pen: minOverlap,
        axis: smallestAxis,
        vertex: contactVertex
    }
}

//Helping functions for the SAT below
//returns the min and max projection values of a shape onto an axis
function projShapeOntoAxis(axis, obj){
    setBallVerticesAlongAxis(obj, axis);
    let min = Vector.dot(axis, obj.vertices[0]);
    let max = min;
    let collVertex = obj.vertices[0];
    for(let i=0; i<obj.vertices.length; i++){
        let p = Vector.dot(axis, obj.vertices[i]);
        if(p<min){
            min = p;
            collVertex = obj.vertices[i];
        } 
        if(p>max){
            max = p;
        }
    }
    return {
        min: min,
        max: max, 
        collVertex: collVertex
    }
}

//finds the projection axes for the two objects
function findAxes(o1, o2){
    let axes = [];
    if(o1 instanceof Circle && o2 instanceof Circle){
        if(o2.position.subtr(o1.position).mag() > 0){
            axes.push(o2.position.subtr(o1.position).unit());
        } else {
            axes.push(new Vector(Math.random(), Math.random()).unit());
        }        
        return axes;
    }
    if(o1 instanceof Circle){
        axes.push(closestVertexToPoint(o2, o1.position).subtr(o1.position).unit());
    }
    if(o1 instanceof Line){
        axes.push(o1.direction.normal());
    }   
    if (o1 instanceof Rectangle){
        axes.push(o1.direction.normal());
        axes.push(o1.direction);
    }
    if (o1 instanceof Triangle){
        axes.push(o1.vertices[1].subtr(o1.vertices[0]).normal());
        axes.push(o1.vertices[2].subtr(o1.vertices[1]).normal());
        axes.push(o1.vertices[0].subtr(o1.vertices[2]).normal());
    }
    if (o2 instanceof Circle){
        axes.push(closestVertexToPoint(o1, o2.position).subtr(o2.position).unit());
    }
    if (o2 instanceof Line){
        axes.push(o2.direction.normal());
    }   
    if (o2 instanceof Rectangle){
        axes.push(o2.direction.normal());
        axes.push(o2.direction);
    }
    if (o2 instanceof Triangle){
        axes.push(o2.vertices[1].subtr(o2.vertices[0]).normal());
        axes.push(o2.vertices[2].subtr(o2.vertices[1]).normal());
        axes.push(o2.vertices[0].subtr(o2.vertices[2]).normal());
    }
    return axes;
}

//iterates through an objects vertices and returns the one that is the closest to the given point
function closestVertexToPoint(obj, p){
    let closestVertex;
    let minDist = null;
    for(let i=0; i<obj.vertices.length; i++){
        if(p.subtr(obj.vertices[i]).mag() < minDist || minDist === null){
            closestVertex = obj.vertices[i];
            minDist = p.subtr(obj.vertices[i]).mag();
        }
    }
    return closestVertex;
}

//returns the number of the axes that belong to an object
function getShapeAxes(obj){
    if(obj instanceof Circle || obj instanceof Line){
        return 1;
    }
    if(obj instanceof Rectangle){
        return 2;
    }
    if(obj instanceof Triangle){
        return 3;
    }
}

//the ball vertices always need to be recalculated based on the current projection axis direction
function setBallVerticesAlongAxis(obj, axis){
    if(obj instanceof Circle){
        obj.vertices[0] = obj.position.add(axis.unit().mult(-obj.r));
        obj.vertices[1] = obj.position.add(axis.unit().mult(obj.r));
    }
}

//Prevents objects to float away from the canvas
function putWallsAround(x1, y1, x2, y2){
    let edge1 = new Wall(x1, y1, x2, y1);
    let edge2 = new Wall(x2, y1, x2, y2);
    let edge3 = new Wall(x2, y2, x1, y2);
    let edge4 = new Wall(x1, y2, x1, y1);
}

function collide(o1, o2){
    let bestSat = {
        pen: null,
        axis: null,
        vertex: null
    }
    for(let o1comp=0; o1comp<o1.components.length; o1comp++){
        for(let o2comp=0; o2comp<o2.components.length; o2comp++){
            if(sat(o1.components[o1comp], o2.components[o2comp]).pen > bestSat.pen){
                bestSat = sat(o1.components[o1comp], o2.components[o2comp]);
            }
        }
    }
    if (bestSat.pen !== null){
        return bestSat;
    } else {
        return false;
    }
}


function userInteraction(){
    BODIES.forEach((b) => {
        b.keyControl();
    })
}

function physicsLoop() {

    let substeps = 8;

    for(let step = 0; step < substeps; step++){
        BODIES.forEach((b) => {
            b.reposition(substeps);
        });
    
    
        COLLISIONS.length = 0;
        
        BODIES.forEach((b, index) => {
            for(let bodyPair = index+1; bodyPair < BODIES.length; bodyPair++){               
                    let bestSat = collide(BODIES[index], BODIES[bodyPair]);
                    if(bestSat){
                        COLLISIONS.push(new CollData(BODIES[index], BODIES[bodyPair], bestSat.axis, bestSat.pen, bestSat.vertex));
                    }           
            }
        });
    
        COLLISIONS.forEach((c) => {
            c.penRes();
            c.collRes();
        });
    }

}

function renderLoop() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    BODIES.forEach((b) => {
        b.render();
    })
    if (clickCollide === true) {
        ctx.fillStyle = "red";
        ctx.font = '15px "JetBrains Mono",monospace';
        ctx.fillText('Object is colliding', 475, 25);
    }


}

function mainLoop(){
    userInteraction();
    physicsLoop();
    renderLoop();
}

