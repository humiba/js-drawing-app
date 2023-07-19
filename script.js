const canvas = document.querySelector('.drawing-board canvas');
const toolButtons = document.querySelectorAll('.tool');
const fillColor = document.getElementById('fill-color');
const sizeSlider = document.getElementById('size-slider');
const colorButtons = document.querySelectorAll('.colors .option');
const colorPicker = document.getElementById('color-picker');
const clearCanvas = document.querySelector('.clear-canvas');
const saveImg = document.querySelector('.save-img');

const ctx = canvas.getContext('2d');

let prevMouseX, prevMouseY, snapshot;
let isDrawing = false;
let brushWidth = 5;
let selectedTool = 'brush'; // init default drawing tool
let selectedColor = '#000'; // init default color

const setCanvasBackground = () => {
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = selectedColor;
}

window.addEventListener('load', () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  setCanvasBackground()
});

const drawRect = (e) => {
  ctx.beginPath();
  // if fillColor is false => draw the shape without background color
  if (!fillColor.checked) {
    return ctx.strokeRect(
      e.offsetX,
      e.offsetY,
      prevMouseX - e.offsetX,
      prevMouseY - e.offsetY
    );
  }

  // else => draw the shape with background color
  ctx.fillRect(
    e.offsetX,
    e.offsetY,
    prevMouseX - e.offsetX,
    prevMouseY - e.offsetY
  );
};

const drawCircle = (e) => {
  ctx.beginPath();
  let radius = Math.sqrt(
    Math.pow(prevMouseX - e.offsetX, 2) + Math.pow(prevMouseY - e.offsetY, 2)
  );
  ctx.arc(prevMouseX, prevMouseY, radius, 0, Math.PI * 2);
  /**
   * if fillColor is false => draw the shape without background color
   * else => draw the shape with background color
   */
  fillColor.checked ? ctx.fill() : ctx.stroke();
};

const drawTriangle = (e) => {
  ctx.beginPath();
  ctx.moveTo(prevMouseX, prevMouseY);
  // Creating first line of triangle
  ctx.lineTo(e.offsetX, e.offsetY);
  // Creating bottom line of triangle
  ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
  // Creating remain line of triangle automatically
  ctx.closePath();

  fillColor.checked ? ctx.fill() : ctx.stroke();
};

const startDraw = (e) => {
  isDrawing = true;
  prevMouseX = e.offsetX;
  prevMouseY = e.offsetY;
  // create new path (position) to draw
  ctx.beginPath();
  // init current width of the line
  ctx.lineWidth = brushWidth;
  ctx.strokeStyle = selectedColor;
  ctx.fillStyle = selectedColor;
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const stopDraw = () => {
  isDrawing = false;
};

const drawing = (e) => {
  // if isDrawing is false => do not render the line
  if (!isDrawing) return;

  ctx.putImageData(snapshot, 0, 0);

  if (selectedTool === 'brush' || selectedTool === 'eraser') {
    ctx.strokeStyle = selectedTool === 'eraser' ? '#fff' : selectedColor;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  } else if (selectedTool === 'rectangle') {
    drawRect(e);
  } else if (selectedTool === 'circle') {
    drawCircle(e);
  } else if (selectedTool === 'triangle') {
    drawTriangle(e);
  }
};

// invoke feature of each button according to their id
toolButtons.forEach((button) => {
  button.addEventListener('click', () => {
    // remove active class from previous option
    const prevButton = document.querySelector('.options .active');
    /**
     * if prevButton exists => remove the class active and add it into current button
     * else, just add the class active into the current button
     * */
    if (prevButton) {
      prevButton.classList.remove('active');
      // add active class into current button
      button.classList.add('active');
    } else {
      button.classList.add('active');
    }
    // start using new tool by re-writing value of selectedTool
    selectedTool = button.id;
  });
});

// Modify the thickness of the drawing line
sizeSlider.addEventListener('change', () => (brushWidth = sizeSlider.value));

// Select color of the line
colorButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const prevButton = document.querySelector('.options .selected');

    if (prevButton) {
      prevButton.classList.remove('selected');
      button.classList.add('selected');
    } else {
      button.classList.add('selected');
    }
    selectedColor = window
      .getComputedStyle(button)
      .getPropertyValue('background-color');
  });
});

// Change the color of color-picker circle
colorPicker.addEventListener('change', () => {
  colorPicker.parentElement.style.backgroundColor = colorPicker.value;

  // the color of the picker changed, but it does not in the canvas => click to the button to set the color again
  colorPicker.parentElement.click();
});

// Clear the canvas (code from ChatGPT)
clearCanvas.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Save image
saveImg.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `${Date.now()}.jpg`;
  link.href = canvas.toDataURL();
  link.click();
});

// start to draw by clicking and keeping the mouse in the canvas
canvas.addEventListener('mousedown', startDraw);

// Move the mouse pointer in the canvas
canvas.addEventListener('mousemove', drawing);

// Stop drawing by un-click the mouse
canvas.addEventListener('mouseup', stopDraw);
