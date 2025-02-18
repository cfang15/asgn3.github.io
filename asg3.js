// Vertex shader program
var VSHADER_SOURCE =
    'precision mediump float;\n' +
    'attribute vec4 a_Position;\n' +
    'attribute vec2 a_UV;\n' +
    'varying vec2 v_UV;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_GlobalRotateMatrix;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ProjectionMatrix;\n' +
    'void main() {\n' +
    '  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
    '  v_UV = a_UV;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec2 v_UV;\n' +
    'uniform vec4 u_FragColor;\n' +
    'uniform sampler2D u_Sampler0;\n' +
    'uniform sampler2D u_Sampler1;\n' +
    'uniform sampler2D u_Sampler2;\n' +
    'uniform sampler2D u_Sampler3;\n' +
    'uniform int u_whichTexture;\n' +
    'void main() {\n' +
    '   if(u_whichTexture == -2){\n' +
    '       gl_FragColor = u_FragColor; }\n' +
    '   else if(u_whichTexture == -1){\n' +
    '       gl_FragColor = vec4(v_UV, 1.0, 1.0); }\n' +
    '   else if(u_whichTexture == 0){\n' +
    '       gl_FragColor = texture2D(u_Sampler0, v_UV); }\n' +
    '   else if(u_whichTexture == 1){\n' +
    '       gl_FragColor = texture2D(u_Sampler1, v_UV); }\n' +
    '   else if(u_whichTexture == 2){\n' +
    '       gl_FragColor = texture2D(u_Sampler2, v_UV); }\n' +
    '   else if(u_whichTexture == 3){\n' +
    '       gl_FragColor = texture2D(u_Sampler3, v_UV); }\n' +
    '   else { gl_FragColor = vec4(1, .2, .2, 1); }\n' +
    '}\n';

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_whichTexture;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;

let g_charON            = false;
let g_CharAnimation     = true;
let g_CharHoverLocation = -0.3;
let g_tailAngle         = 0;
let g_fireSize          = 1;
let g_blink             = 1;
let g_wingAngle         = 40;
let g_limbAngle         = 0;
let g_armsAngle         = 0;
let g_forearmsAngle     = 0;

let g_globalAngle = 0;
var g_startTime = performance.now() / 1000.0;
var g_seconds   = performance.now() / 1000.0 - g_startTime;
let g_camera = new Camera();

let g_map = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 3, 0, 1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 4, 5, 5, 5, 5, 5, 5, 5, 5, 4, 2, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 5, 6, 6, 6, 6, 6, 6, 5, 4, 2, 0, 0, 0, 0, 0],
    [0, 0, 3, 2, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 2, 4, 5, 6, 8, 8, 8, 8, 6, 5, 4, 2, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 5, 6, 8, 9, 9, 8, 6, 5, 4, 2, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 5, 6, 8, 9, 9, 8, 6, 5, 4, 2, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 0, 2, 4, 5, 6, 8, 8, 8, 8, 6, 5, 4, 2, 1, 0, 2, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 2, 4, 5, 6, 6, 6, 6, 6, 6, 5, 4, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 5, 5, 5, 5, 5, 5, 5, 5, 4, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 3, 2],
    [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 1, 0, 0, 1, 2, 1, 0, 1, 0, 0, 0, 0, 4, 1],
    [0, 0, 0, 0, 1, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]
];

// --- Additional Game Story Elements ---
// A simple "mob" (red cube) will chase you in the world.
// If it gets too close, the game is over.
let g_mob = { x: 0, y: -0.75, z: 10 };
g_mob.speed = 0.02;  // Adjust speed as desired
let g_gameOver = false;

function updateMobPosition() {
    if (g_gameOver) return;
    // Compute direction from mob to camera's eye (only horizontal)
    let dx = g_camera.eye.elements[0] - g_mob.x;
    let dz = g_camera.eye.elements[2] - g_mob.z;
    let dist = Math.sqrt(dx * dx + dz * dz);
    // If too close, end the game
    if (dist < 0.5) {
        g_gameOver = true;
        alert("Game Over: The mob caught you!");
        return;
    }
    // Move mob a small step toward the camera's eye
    let step = g_mob.speed;
    dx /= dist;
    dz /= dist;
    g_mob.x += dx * step;
    g_mob.z += dz * step;
}

function renderMob() {
    let mobCube = new Cube();
    mobCube.color = [1, 0, 0, 1];  // Red color for the mob
    mobCube.matrix.translate(g_mob.x, g_mob.y, g_mob.z);
    mobCube.matrix.scale(0.5, 0.5, 0.5);
    mobCube.render();
}

// --- End Game Story Elements ---

function setupCanvas(){
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function connectVariablesToGLSL(){
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if(!u_Sampler0){
        console.log('Failed to create the u_Sampler0 object');
        return;
    }
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if(!u_Sampler1){
        console.log('Failed to create the u_Sampler1 object');
        return;
    }
    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if(!u_Sampler2){
        console.log('Failed to create the u_Sampler2 object');
        return;
    }
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if(!u_whichTexture){
        console.log('Failed to create the u_whichTexture object');
        return;
    }
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}



function convertCoordEventToWebGL(ev){
    var x = ev.clientX;
    var y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    x = ((x - rect.left) - canvas.width/2) / (canvas.width/2);
    y = (canvas.height/2 - (y - rect.top)) / (canvas.height/2);
    return ([x,y]);
}

function initTextures(){
    var image0 = new Image();
    image0.crossOrigin = "anonymous";
    if(!image0){
        console.log('Failed to create the image0 object');
        return false;
    }
    image0.onload = function(){ sendTextureToTEXTURE0(image0); };
    image0.src = 'snowrock.jpg';
    
    var image1 = new Image();
    image1.crossOrigin = "anonymous";
    if(!image1){
        console.log('Failed to create the image1 object');
        return false;
    }
    image1.onload = function(){ sendTextureToTEXTURE1(image1); };
    image1.src = 'snow.jpeg';
    
    var image2 = new Image();
    image2.crossOrigin = "anonymous";
    if(!image2){
        console.log('Failed to create the image2 object');
        return false;
    }
    image2.onload = function(){ sendTextureToTEXTURE2(image2); };
    image2.src = 'magma.png';
    
    return true;
}

function sendTextureToTEXTURE0(image){
    var texture = gl.createTexture();
    if(!texture){
        console.log('Failed to create the texture0 object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler0, 0);
}

function sendTextureToTEXTURE1(image){
    var texture = gl.createTexture();
    if(!texture){
        console.log('Failed to create the texture1 object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler1, 1);
}

function sendTextureToTEXTURE2(image){
    var texture = gl.createTexture();
    if(!texture){
        console.log('Failed to create the texture2 object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler2, 2);
}

function sendTextureToTEXTURE3(image){
    var texture = gl.createTexture();
    if(!texture){
        console.log('Failed to create the texture3 object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler3, 3);
}

// --- Mouse-based camera rotation ---
function initMouseEvents() {
    var isMouseDown = false;
    var lastMouseX = 0;
    var lastMouseY = 0;
    if (g_camera.yaw === undefined) {
        var dx = g_camera.at.elements[0] - g_camera.eye.elements[0];
        var dz = g_camera.at.elements[2] - g_camera.eye.elements[2];
        g_camera.yaw = Math.atan2(dx, -dz) * 180 / Math.PI;
    }
    canvas.addEventListener('mousedown', function(e) {
        isMouseDown = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });
    canvas.addEventListener('mouseup', function(e) {
        isMouseDown = false;
    });
    canvas.addEventListener('mousemove', function(e) {
        if (!isMouseDown) return;
        var deltaX = e.clientX - lastMouseX;
        var rotationFactor = 0.5; // degrees per pixel
        g_camera.yaw += deltaX * rotationFactor;
        var dx = g_camera.at.elements[0] - g_camera.eye.elements[0];
        var dz = g_camera.at.elements[2] - g_camera.eye.elements[2];
        var distance = Math.sqrt(dx * dx + dz * dz);
        var rad = g_camera.yaw * Math.PI / 180;
        g_camera.at.elements[0] = g_camera.eye.elements[0] + Math.sin(rad) * distance;
        g_camera.at.elements[2] = g_camera.eye.elements[2] - Math.cos(rad) * distance;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        renderAllShapes();
    });
}

function addBlockInFront() {
    var dx = g_camera.at.elements[0] - g_camera.eye.elements[0];
    var dz = g_camera.at.elements[2] - g_camera.eye.elements[2];
    var mag = Math.sqrt(dx * dx + dz * dz);
    if(mag === 0) return;
    dx /= mag;
    dz /= mag;
    var d = 1; 
    var targetX = g_camera.eye.elements[0] + dx * d;
    var targetZ = g_camera.eye.elements[2] + dz * d;
    var gridCol = Math.round(targetX + 4);
    var gridRow = Math.round(targetZ + 4);
    if(gridRow >= 0 && gridRow < 32 && gridCol >= 0 && gridCol < 32) {
         g_map[gridRow][gridCol] = (g_map[gridRow][gridCol] || 0) + 1;
         console.log("Added block at (" + gridRow + ", " + gridCol + "). New height: " + g_map[gridRow][gridCol]);
    } else {
         console.log("Target position out of bounds: (" + gridRow + ", " + gridCol + ")");
    }
    renderAllShapes();
}

function removeBlockInFront() {
    var dx = g_camera.at.elements[0] - g_camera.eye.elements[0];
    var dz = g_camera.at.elements[2] - g_camera.eye.elements[2];
    var mag = Math.sqrt(dx * dx + dz * dz);
    if(mag === 0) return;
    dx /= mag;
    dz /= mag;

    var targetX = g_camera.eye.elements[0] + dx * d;
    var targetZ = g_camera.eye.elements[2] + dz * d;
    var gridCol = Math.round(targetX + 4);
    var gridRow = Math.round(targetZ + 4);
    if(gridRow >= 0 && gridRow < 32 && gridCol >= 0 && gridCol < 32) {
         if(g_map[gridRow][gridCol] > 0) {
             g_map[gridRow][gridCol]--;
             console.log("Removed block at (" + gridRow + ", " + gridCol + "). New height: " + g_map[gridRow][gridCol]);
         } else {
             console.log("No block to remove at (" + gridRow + ", " + gridCol + ")");
         }
    } else {
         console.log("Target position out of bounds: (" + gridRow + ", " + gridCol + ")");
    }
    renderAllShapes();
}

function main(){
    setupCanvas();
    connectVariablesToGLSL();
    initTextures();
    initMouseEvents(); 
    document.onkeydown = keydown;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    requestAnimationFrame(tick);
}

function tick(){
    g_seconds = performance.now() / 1000.0 - g_startTime;
    updateAnimationTransformations();
    updateMobPosition();  // Update the mob's position each frame
    renderAllShapes();
    requestAnimationFrame(tick);
}

function updateAnimationTransformations(){
    if(g_CharAnimation){ 
        g_CharHoverLocation = (Math.sin(g_seconds * 3) / 30) - 0.3;
        g_tailAngle = 5 * Math.sin(g_seconds * 3);
        g_fireSize = Math.abs(Math.sin(g_seconds * 4));
        g_blink = Math.abs(Math.sin(g_seconds * 3));
        g_wingAngle = 20 * Math.sin(g_seconds * 3) + 40;
        g_limbAngle = 5 * Math.sin(g_seconds * 3);
        g_armsAngle = 10 * Math.sin(g_seconds * 3);
        g_forearmsAngle = 20 * Math.sin(g_seconds * 3);
    }
}

function keydown(ev){
    if(ev.keyCode == 68){     
        g_camera.right();
    }
    else if(ev.keyCode == 65){ 
        g_camera.left();  
    }
    else if(ev.keyCode == 87){ 
        g_camera.forward();
    }
    else if(ev.keyCode == 83){ 
        g_camera.backward();
    }
    else if(ev.keyCode == 69){ 
        g_camera.rotRight();
    }
    else if(ev.keyCode == 81){
        g_camera.rotLeft();
    }
    else if(ev.keyCode == 90){
        g_camera.upward();
    }
    else if(ev.keyCode == 88){
        g_camera.downward();
    }
    else if(ev.keyCode == 67){ 
        addBlockInFront();
    }
    else if(ev.keyCode == 86){
        removeBlockInFront();
    }
    renderAllShapes();
}

function renderAllShapes(){
    var projMat = new Matrix4();
    projMat.setPerspective(60, canvas.width / canvas.height, 0.1, 100); 
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
    var viewMat = new Matrix4();
    viewMat.setLookAt(
        g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],  
        g_camera.at.elements[0],  g_camera.at.elements[1],  g_camera.at.elements[2],
        g_camera.up.elements[0],  g_camera.up.elements[1],  g_camera.up.elements[2]);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);
    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawSetting();
    drawMap();   // This function builds the walls from the map.
    if(g_charON){ 
        renderCharShapes(); 
    }
    // Render the chasing mob (if game not over)
    if (!g_gameOver) {
        renderMob();
    }
}

function drawSetting(){
    var ocean = new Cube();
    ocean.color = [0, 0.25, 0.5, 1];
    ocean.matrix.translate(0, -0.9, 0);
    ocean.matrix.scale(63, 0.1, 63);
    ocean.matrix.translate(-0.35, 0, -0.35);
    ocean.render();

    var floor = new Cube();
    floor.textureNum = 1;
    floor.matrix.translate(0, -0.75, 0);
    floor.matrix.scale(35, 0.01, 35);
    floor.matrix.translate(-0.15, 0, -0.15);
    floor.render();

    var sky = new Cube();
    sky.color = [0, 0, 1, 0.5];
    sky.matrix.translate(-1, 0, -1);
    sky.matrix.scale(60, 60, 60);
    sky.matrix.translate(-0.3, -0.5, -0.3);
    sky.render();

    var sun = new Cube();
    sun.color = [1, 0.7, 0.2, 1];
    sun.matrix.translate(-17.5, 0, 0);
    sun.matrix.scale(1, 10, 10);
    sun.matrix.translate(-2, -0.5, 0.5);
    sun.render();
}


function drawMap(){
    for (let row = 0; row < g_map.length; row++){
        for (let col = 0; col < g_map[row].length; col++){
            let wallHeight = g_map[row][col];
            if (wallHeight > 0){
                for (let h = 0; h < wallHeight; h++){
                    let cube = new Cube();
                    // Optionally change texture based on wall height:
                    cube.textureNum = (wallHeight <= 5) ? 0 : 2;
                    // Translate so that the cube appears at grid position (col, row) and at height h.
                    cube.matrix.translate(col - 4, h - 0.75, row - 4);
                    cube.renderfaster();
                }
            }
        }
    }
}

