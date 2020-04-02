const scr = document.getElementById("screen");
const ui = document.getElementById("UI");

scr.width  = window.innerWidth;
scr.height = window.innerHeight;
ui.width  = window.innerWidth;
ui.height = window.innerHeight;

ui.requestPointerLock = ui.requestPointerLock || ui.mozRequestPointerLock;

document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

const ctx = scr.getContext("2d");

let meshes = [];
let mover = [0, 0, 0];

let px = scr.width/2;
let py = scr.height/2;

let rdist = 10;
let chunkSize = 256;

class mesh{
    constructor(points, color, normal){
        this.points = points ? points : [];
        this.color = color;
        this.normal = normal;
    }
    add(point){
        this.points.push(point);
    }
}
class camera{
    constructor(x, y, z, rx, rz, sensitivity, focal, speed){
        this.x = x;
        this.y = y;
        this.z = z;
        this.rx = rx;
        this.rz = rz;
        this.sensitivity = sensitivity;
        this.focal = focal;
        this.speed = speed;
    }
    rotate(way){
        this.rx += way.x * this.sensitivity;
        this.rz += way.z * this.sensitivity;
    }
}

class point{
    constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

function house(x, y, z){
    let houseMesh = [];
    
}

//meshes.push(new mesh([new point(5, 5, 5, "orange"), new point(5, 8, 5, "orange"), new point(5, 5, 1, "orange")], "orange", 1));

let mainCam = new camera(0, 0, 445, -Math.PI / 2, 0, 1, 500, 1);

function draw(){
    ctx.clearRect(0, 0, scr.width, scr.height);
    mainCam.x += Math.sin(-mainCam.rz) * mover[1] * mainCam.speed + Math.cos(mainCam.rz) * mover[0] * mainCam.speed;
    mainCam.y += Math.sin(mainCam.rz) * mover[0] * mainCam.speed + Math.cos(-mainCam.rz) * mover[1] * mainCam.speed;
    mainCam.z += mover[2] * mainCam.speed;
    for(mesh of meshes){
        ctx.beginPath();
        for(i = 0; i < mesh.points.length; i++){
            let point = mesh.points[i];
            /*
            let d1 = multiply(delta, [[1, 0, 0], [0, Math.cos(mainCam.rx), -Math.sin(mainCam.rx)], [0, Math.sin(mainCam.rx), Math.cos(mainCam.rx)]]);
            console.log(d1);
            
            let d2 = multiply(d1, [[Math.cos(mainCam.ry), 0, Math.sin(mainCam.ry)], [0, 1, 0], [-Math.sin(mainCam.ry), 0, Math.cos(mainCam.ry)]]);

            let d3 = multiply(d2, [[Math.cos(mainCam.rz), -Math.sin(mainCam.rz), 0], [Math.sin(mainCam.rz), Math.cos(mainCam.rz), 0], [0, 0, 1]]);

            let f1 = multiply(d3, [[1, 0, 0], [0, 1, 0], [scr.width/(2*mainCam.focal), scr.height/(2*mainCam.focal), 1/mainCam.focal]]);

            bx = f1[0]/f1[2];
            by = f1[1]/f1[2];

            */

            let b = project(point.x, point.y, point.z);
            if(b){
                if(i == 0) ctx.moveTo(b[0], b[1]);
                else ctx.lineTo(b[0], b[1]);
            }

        }
        let dxs = [[mesh.points[1].x - mesh.points[0].x, mesh.points[1].y - mesh.points[0].y, mesh.points[1].z - mesh.points[0].z],
                    [mesh.points[2].x - mesh.points[0].x, mesh.points[2].y - mesh.points[0].y, mesh.points[2].z - mesh.points[0].z],
                    [mainCam.x - mesh.points[0].x, mainCam.y - mesh.points[0].y, mainCam.z - mesh.points[0].z]];
        let det = dxs[0][0]*dxs[1][1]*dxs[2][2] + dxs[0][1]*dxs[1][2]*dxs[2][0] + dxs[0][2]*dxs[1][0]*dxs[2][1] - dxs[0][2]*dxs[1][1]*dxs[2][0] - dxs[0][1]*dxs[1][0]*dxs[2][2] - dxs[0][0]*dxs[1][2]*dxs[2][1];

        if(det * mesh.normal > 0){
            ctx.fillStyle = mesh.color;
            ctx.fill();
        }
        else{
            ctx.closePath();
        }
    }
    let sx = Math.tan(mainCam.rx) * mainCam.z * Math.sin(-mainCam.rz);
    let sy = Math.tan(mainCam.rx) * mainCam.z * Math.cos(-mainCam.rz);
    if(sx < rdist * chunkSize && sy < rdist * chunkSize){
        let pr = project(sx + mainCam.x, sy + mainCam.y, 0);
        if(pr){
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(pr[0], pr[1] , 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    setTimeout(draw, 1000/144);
}

function project(x, y, z){

    dx = mainCam.x - x;
    dy = mainCam.y - y;
    dz = mainCam.z - z;

    let gz = Math.cos(mainCam.rx) * dz - Math.sin(mainCam.rx) * (Math.cos(mainCam.rz) * dy - Math.sin(mainCam.rz) * dx);

    if(gz > 0){
        let gx = Math.sin(mainCam.rz) * dy + Math.cos(mainCam.rz) * dx;
        let gy = Math.sin(mainCam.rx) * dz + Math.cos(mainCam.rx) * (Math.cos(mainCam.rz) * dy - Math.sin(mainCam.rz) * dx);
        let bx = -mainCam.focal * gx / gz + px;
        let by = -mainCam.focal * gy / gz + py;
        return [bx, by];
    }
    else{
        return;
    }

}

function terrain(){
    let startX = - rdist * chunkSize;
    let startY = - rdist * chunkSize;
    for(x = 0; x < rdist*2; x++){
        for(y = 0; y < rdist*2; y++){
            
            meshes.push(new mesh([new point(startX + x * chunkSize, startY + y * chunkSize, 0), new point(startX + x * chunkSize + chunkSize, startY + y * chunkSize, 0), new point(startX + x * chunkSize + chunkSize, startY + y * chunkSize + chunkSize, 0), new point(startX + x * chunkSize, startY + y * chunkSize + chunkSize, 0)],randomHSLwithrange(),1));
            /*
            let pointX = rand(chunkSize * 0.25, chunkSize * 0.75);
            let pointY = rand(chunkSize * 0.25, chunkSize * 0.75);
            let pointZ = rand(-35, 35);
            meshes.push(new mesh([new point(startX + x * chunkSize, startY + y * chunkSize, 0), new point(startX + x * chunkSize + pointX, startY + y * chunkSize + pointY, pointZ), new point(startX + x * chunkSize + chunkSize, startY + y * chunkSize, 0)], randomHSLwithrange(), -1));
            meshes.push(new mesh([new point(startX + x * chunkSize + chunkSize, startY + y * chunkSize, 0), new point(startX + x * chunkSize + pointX, startY + y * chunkSize + pointY, pointZ), new point(startX + x * chunkSize + chunkSize, startY + y * chunkSize + chunkSize, 0)], randomHSLwithrange(), -1));
            meshes.push(new mesh([new point(startX + x * chunkSize + chunkSize, startY + y * chunkSize + chunkSize, 0), new point(startX + x * chunkSize + pointX, startY + y * chunkSize + pointY, pointZ), new point(startX + x * chunkSize, startY + y * chunkSize + chunkSize, 0)], randomHSLwithrange(), -1));
            meshes.push(new mesh([new point(startX + x * chunkSize, startY + y * chunkSize + chunkSize, 0), new point(startX + x * chunkSize + pointX, startY + y * chunkSize + pointY, pointZ), new point(startX + x * chunkSize, startY + y * chunkSize, 0)], randomHSLwithrange(), -1));*/
        }
    }
}

function randomHSLwithrange() {
    var h = rand(120, 140);
    var l = rand(45, 50);
    return `hsl(${h}, 40%, ${l}%)`;
}

function rand(min, max) {
    return min + Math.random() * (max - min);
}


terrain();
draw();

window.addEventListener("keydown", (e) => {
    switch(e.key){
        case "a":
            mover[0] = -1;
        break;
        case "d":
            mover[0] = 1;
        break;
        case "s":
            mover[1] = 1;
        break;
        case "w":
            mover[1] = -1;
        break;
        case " ":
            mover[2] = 1;
        break;
        case "Shift":
            mover[2] = -1;
        break;
    }
})
window.addEventListener("keyup", (e) => {
    switch(e.key){
        case "a":
            mover[0] = 0;
        break;
        case "d":
            mover[0] = 0;
        break;
        case "s":
            mover[1] = 0;
        break;
        case "w":
            mover[1] = 0;
        break;
        case " ":
            mover[2] = 0;
        break;
        case "Shift":
            mover[2] = 0;
        break;
    }
})

ui.onclick = () => {
    ui.requestPointerLock();
}

document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

function lockChangeAlert() {
    if (document.pointerLockElement === ui ||
        document.mozPointerLockElement === ui) {
      document.addEventListener("mousemove", updatePosition, false);
    } else {
      document.removeEventListener("mousemove", updatePosition, false);
    }
}

let updatePosition = (e) => {
    mainCam.rz += e.movementX/400;
    mainCam.rx += e.movementY/400;
}