// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = '' +
    'attribute vec4 a_Position;' +
    'uniform mat4 u_ModelMatrix;' +
    'uniform mat4 u_GlobalRotateMatrix;' +
    'void main() {' +
    '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;' +
    '}' 

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

//Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL()
{
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');
  
  // Get the rendering context for WebGL
  gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL()
{
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
  
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}


// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global UI variables
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle= 0;
let g_headAngle = 0;
let g_rightArmAngle = 225;
let g_leftArmAngle = 135;
let anim = false;

function addActionsForHTMLUI() {
  // Button Events
  document.getElementById('animationOn').onclick = function() {anim = true};
  document.getElementById('animationOff').onclick = function() {anim = false};

  // Slider Events
  const angleSlider = document.getElementById('angleSlide');
  const angleDisplay = document.getElementById('angleValue');
  angleSlider.addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes(); angleDisplay.textContent = this.value;});

  //Joint Sliders
  const headSlider = document.getElementById('headSlide');
  const headDisplay = document.getElementById('headValue');
  headSlider.addEventListener('mousemove', function() {g_headAngle = this.value; renderAllShapes(); headDisplay.textContent = this.value;});

  // Right Arm Slider Events
  const rightArmSlider = document.getElementById('rightArmSlide');
  const rightArmDisplay = document.getElementById('rightArmValue');
  rightArmSlider.addEventListener('mousemove', function() {g_rightArmAngle = this.value; renderAllShapes(); rightArmDisplay.textContent = this.value;});

  // Left Arm Slider Events
  const leftArmSlider = document.getElementById('leftArmSlide');
  const leftArmDisplay = document.getElementById('leftArmValue');
  leftArmSlider.addEventListener('mousemove', function() {g_leftArmAngle = this.value; renderAllShapes(); leftArmDisplay.textContent = this.value;});
}

function main() {

  setupWebGL();
  
  connectVariablesToGLSL();
  
  addActionsForHTMLUI();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 0.5);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  requestAnimationFrame(tick);
}

var g_strartTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_strartTime;

function tick() {
  g_seconds = performance.now()/1000.0 - g_strartTime;
  console.log(g_seconds);

  if (anim){
    updateAnimationAngles();
  }

  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {

  // Animation for the head angle (-10 to 20 degrees)
  g_headAngle = -10 + 15 * Math.sin(g_seconds * 2); // Oscillates between -10 and 20

  // Animation for the right arm angle (220 to 245 degrees)
  g_rightArmAngle = 220 + 12.5 * Math.sin(g_seconds * 3); // Oscillates between 220 and 245

  // Animation for the left arm angle (110 to 130 degrees)
  g_leftArmAngle = 135 + 10 * Math.sin(g_seconds * 3); // Oscillates between 110 and 130

}


function convertCoordinatesEvenToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x, y]);
}

function renderAllShapes() {
  var startTime = performance.now();
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  
  //TAIL
  var body = new Cube();
  body.color = [1.0, 0.85, 0.0, 1.0]; // yellow
  body.matrix.setTranslate(0, -0.65, 0);
  body.matrix.scale(0.1, 0.1, 0.45);
  body.render();

  var body = new Cube();
  body.color = [0, 0, 0.0, 1.0]; // yellow
  body.matrix.setTranslate(0, -0.65, 0.6);
  body.matrix.scale(0.1, 0.1, 0.2);
  body.render();

  var body = new Cube();
  body.color = [1.0, 0.85, 0.0, 1.0]; // yellow
  body.matrix.setTranslate(0, -0.65, 0.5);
  body.matrix.scale(0.1, 0.1, 0.1);
  body.render();
  
  var body = new Cube();
  body.color = [0, 0, 0.0, 1.0]; // yellow
  body.matrix.setTranslate(0, -0.65, 0.45);
  body.matrix.scale(0.1, 0.1, 0.05);
  body.render();
  
  //LEGS
  var body = new Cube();
  body.color = [0, 0, 0, 0]; // yellow
  body.matrix.setTranslate(0.19, -1.03, -0.22);
  body.matrix.scale(0.09, 0.09, 0.1);
  body.render();

  var body = new Cube();
  body.color = [0, 0, 0, 0]; // yellow
  body.matrix.setTranslate(-0.19, -1.03, -0.22);
  body.matrix.scale(0.09, 0.09, 0.05);
  body.render();
  
  var body = new Cube();
  body.color = [1.0, 0.85, 0.0, 1.0]; // yellow
  body.matrix.setTranslate(0.19, -1.03, -0.2);
  body.matrix.scale(0.1, 0.1, 0.2);
  body.render();

  var body = new Cube();
  body.color = [1.0, 0.85, 0.0, 1.0]; // yellow
  body.matrix.setTranslate(-0.19, -1.03, -0.2);
  body.matrix.scale(0.1, 0.1, 0.2);
  body.render();
  
  var body = new Cube();
  body.color = [1.0, 0.85, 0.0, 1.0]; // yellow
  body.matrix.setTranslate(0.19, -0.93, -0.1);
  body.matrix.scale(0.1, 0.3, 0.3);
  body.render();

  var body = new Cube();
  body.color = [1.0, 0.85, 0.0, 1.0]; // yellow
  body.matrix.setTranslate(-0.19, -0.93, -0.1);
  body.matrix.scale(0.1, 0.3, 0.3);
  body.render();

  //MAIN BODY
  var body = new Cube();
  body.color = [1.0, 0.85, 0.0, 1.0]; // yellow
  body.matrix.setTranslate(-0.15, -0.75, -0.18);
  body.matrix.scale(0.4, 0.7, 0.4);
  body.render();

  var body = new Cube();
  body.color = [0.0, 0.0, 0.0, 0.0]; // yellow
  body.matrix.setTranslate(-0.1, -0.75, -0.2);
  body.matrix.scale(0.3, 0.6, 0.05);
  body.render();
  
  //neck
  var body = new Cube();
  body.color = [0.0, 0.0, 0.0, 1.0]; // black
  body.matrix.setTranslate(-0.025, -0.05, -0.025);
  body.matrix.scale(0.15, 0.05, 0.15);
  body.render();
  
  var body1 = new Cube();
  body1.color = [1.0, 0.85, 0.0, 1.0]; // yellow
  body1.matrix.setTranslate(-0.0125, 0, -0.0125);
  body1.matrix.scale(0.12, 0.05, 0.12);
  body1.render();

  var body2 = new Cube();
  body2.color = [0.0, 0.0, 0.0, 1.0]; 
  body2.matrix.setTranslate(0.0, 0.05, 0.0);
  body2.matrix.scale(0.1, 0.05, 0.1);
  body2.render();

  var body3 = new Cube();
  body3.color = [1.0, 0.85, 0.0, 1.0]; 
  body3.matrix.setTranslate(0.0, 0.1, 0.0);
  body3.matrix.scale(0.1, 0.05, 0.1);
  body3.render();

  var body4 = new Cube();
  body4.color = [0.0, 0.0, 0.0, 1.0]; 
  body4.matrix.setTranslate(0.0, 0.15, 0.0);
  body4.matrix.scale(0.1, 0.05, 0.1);
  body4.render();

  var body5 = new Cube();
  body5.color = [1.0, 0.85, 0.0, 1.0];
  body5.matrix.setTranslate(0.0, 0.2, 0.0);
  body5.matrix.scale(0.1, 0.2, 0.1);
  body5.render();

  // HEAD
  var head = new Cube();
  head.color = [1.0, 0.85, 0.0, 1.0];
  head.matrix.setTranslate(-0.1, 0.3, 0.15);
  head.matrix.rotate(g_headAngle, 1, 0, 0);
  var headCoordinates = new Matrix4(head.matrix); // Save transformation before scaling
  head.matrix.scale(0.3, 0.3, -0.4);
  head.render();

// ORB
  var orb = new Cube();
  orb.color = [1.0, 0.0, 0.0, 1.0];
  orb.matrix = new Matrix4(headCoordinates);
  orb.matrix.translate(0.1, 0.25, -0.2); // Position relative to head center
  orb.matrix.scale(0.1, 0.1, 0.1);
  orb.render();
  
  // TAIL ORB
  var orb = new Cube();
  orb.color = [1.0, 0.0, 0.0, 1.0];
  orb.matrix.translate(-0.025, -0.6, 0.7); // Position relative to head center
  orb.matrix.scale(0.15, 0.15, 0.15);
  orb.render();

// RIGHT EAR (stacked parts)
  var earR1 = new Cube();
  earR1.color = [1.0, 0.85, 0.0, 1.0];
  earR1.matrix = new Matrix4(headCoordinates);
  earR1.matrix.translate(0.24, 0.3, -0.1);
  earR1.matrix.scale(0.08, 0.05, 0.08);
  earR1.render();

  var earR2 = new Cube();
  earR2.color = [0.0, 0.0, 0.0, 1.0];
  earR2.matrix = new Matrix4(headCoordinates);
  earR2.matrix.translate(0.23, 0.35, -0.11);
  earR2.matrix.scale(0.1, 0.05, 0.1);
  earR2.render();

  var earR3 = new Cube();
  earR3.color = [1.0, 0.85, 0.0, 1.0];
  earR3.matrix = new Matrix4(headCoordinates);
  earR3.matrix.translate(0.24, 0.4, -0.1);
  earR3.matrix.scale(0.08, 0.025, 0.08);
  earR3.render();

  var earR4 = new Cube();
  earR4.color = [0.0, 0.0, 0.0, 1.0];
  earR4.matrix = new Matrix4(headCoordinates);
  earR4.matrix.translate(0.25, 0.425, -0.09);
  earR4.matrix.scale(0.06, 0.025, 0.06);
  earR4.render();

// LEFT EAR (stacked parts)
  var earL1 = new Cube();
  earL1.color = [1.0, 0.85, 0.0, 1.0];
  earL1.matrix = new Matrix4(headCoordinates);
  earL1.matrix.translate(-0.02, 0.3, -0.1);
  earL1.matrix.scale(0.08, 0.05, 0.08);
  earL1.render();

  var earL2 = new Cube();
  earL2.color = [0.0, 0.0, 0.0, 1.0];
  earL2.matrix = new Matrix4(headCoordinates);
  earL2.matrix.translate(-0.03, 0.35, -0.11);
  earL2.matrix.scale(0.1, 0.05, 0.1);
  earL2.render();

  var earL3 = new Cube();
  earL3.color = [1.0, 0.85, 0.0, 1.0];
  earL3.matrix = new Matrix4(headCoordinates);
  earL3.matrix.translate(-0.02, 0.4, -0.1);
  earL3.matrix.scale(0.08, 0.025, 0.08);
  earL3.render();

  var earL4 = new Cube();
  earL4.color = [0.0, 0.0, 0.0, 1.0];
  earL4.matrix = new Matrix4(headCoordinates);
  earL4.matrix.translate(-0.01, 0.425, -0.09);
  earL4.matrix.scale(0.06, 0.025, 0.06);
  earL4.render();

// RIGHT EYE
  var eyeR1 = new Cube();
  eyeR1.color = [0.0, 0.0, 0.0, 1.0];
  eyeR1.matrix = new Matrix4(headCoordinates);
  eyeR1.matrix.translate(0.21, 0.15, -0.14);
  eyeR1.matrix.scale(0.1, 0.1, 0.1);
  eyeR1.render();

  var eyeR2 = new Cube();
  eyeR2.color = [0.0, 0.0, 0.0, 0.0];
  eyeR2.matrix = new Matrix4(headCoordinates);
  eyeR2.matrix.translate(0.265, 0.185, -0.13);
  eyeR2.matrix.scale(0.05, 0.05, 0.05);
  eyeR2.render();

// LEFT EYE
  var eyeL1 = new Cube();
  eyeL1.color = [0.0, 0.0, 0.0, 1.0];
  eyeL1.matrix = new Matrix4(headCoordinates);
  eyeL1.matrix.translate(-0.01, 0.15, -0.14);
  eyeL1.matrix.scale(0.1, 0.1, 0.1);
  eyeL1.render();

  var eyeL2 = new Cube();
  eyeL2.color = [0.0, 0.0, 0.0, 0.0];
  eyeL2.matrix = new Matrix4(headCoordinates);
  eyeL2.matrix.translate(-0.015, 0.185, -0.13);
  eyeL2.matrix.scale(0.05, 0.05, 0.05);
  eyeL2.render();

  var rightArm = new Cube();
  rightArm.color = [1.0, 0.85, 0.0, 1.0];
  rightArm.matrix.setTranslate(0.25, -0.2, -0.15);
  rightArm.matrix.rotate(g_rightArmAngle, 0, 0, 1);
  rightArm.matrix.scale(0.1, 0.5, 0.3);
  rightArm.render();

  var leftArm = new Cube();
  leftArm.color = [1.0, 0.85, 0.0, 1.0];
  leftArm.matrix.setTranslate(-0.05, -0.1, 0.15);
  leftArm.matrix.rotate(g_leftArmAngle, 0, 0, 1);
  leftArm.matrix.scale(-0.1, 0.6, -0.3);
  leftArm.render();






  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}


function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}