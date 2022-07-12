let canvas, ctx;
let minReal = -2.0, maxReal = 1.0, minImaginary = -1.2, maxImaginary, realFactor, imaginaryFactor;
const ZOOM_FACTOR = 10;

const MAX_ITERATIONS = 100;
const MAX_ITERATIONS_HALF = Math.floor(MAX_ITERATIONS/2);

window.onload = init;

function init() {
  canvas = document.getElementById('canvas');
  canvas.addEventListener('dblclick', (e) => {
    zoomIn(getComplexReal(e.offsetX), getComplexImaginary(e.offsetY));
  });
  setWindowSize();
}

const getComplexReal = (x) => minReal + x*realFactor;
const getComplexImaginary = (y) => maxImaginary - y*imaginaryFactor;

function calculateImage() {
  ctx = canvas.getContext('2d');
  // console.log('canvas.height: ' + canvas.height)
  // console.log('canvas.width: ' + canvas.width)

  // console.log('minReal: ' + minReal)
  // console.log('maxReal: ' + maxReal)
  // console.log('minImaginary: ' + minImaginary)
  // console.log('maxImaginary: ' + maxImaginary)
  // console.log('realFactor: ' + realFactor)
  // console.log('imaginaryFactor' + imaginaryFactor)

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      const cReal = getComplexReal(x);
      const cImaginary = getComplexImaginary(y);

      let zReal = cReal, zImaginary = cImaginary, lastIteration = 0;
      for (let i = 0; i<MAX_ITERATIONS;i++) {
        if (zReal*zReal + zImaginary*zImaginary > 4) {
          break;
        }
        const zImaginarySquared = zImaginary*zImaginary;
        zImaginary = 2*zReal*zImaginary + cImaginary;
        zReal = zReal*zReal - zImaginarySquared + cReal

        lastIteration++;
      }

      let r, g, b;
      if (lastIteration === MAX_ITERATIONS) {
        r = 0;
        g = 0;
        b = 0;
      } else if (lastIteration >= MAX_ITERATIONS_HALF && lastIteration < MAX_ITERATIONS) {
        r = 255;
        g = 255 * (lastIteration - (MAX_ITERATIONS_HALF - 1)) / MAX_ITERATIONS_HALF;
        b = 255 * (lastIteration - (MAX_ITERATIONS_HALF - 1)) / MAX_ITERATIONS_HALF;
      } else if (lastIteration >=0 && lastIteration < MAX_ITERATIONS_HALF) {
        r = 255 * (lastIteration / (MAX_ITERATIONS_HALF - 1))
        g = 0;
        b = 0;
      }
      // if (lastIteration === MAX_ITERATIONS) {
      //   r = 0;
      //   g = 0;
      //   b = 0;
      // } else if (lastIteration <= Math.floor(MAX_ITERATIONS/2)-1) {
      //   r = 255 * (lastIteration / Math.floor(MAX_ITERATIONS/2)-1);
      //   g = 0;
      //   b = 0;
      // } else {
      //   r = 255;
      //   g = 255 * (lastIteration - (Math.floor(MAX_ITERATIONS/2) - 1) / Math.floor(MAX_ITERATIONS/2) - 1);
      //   b = 255 * (lastIteration - (Math.floor(MAX_ITERATIONS/2) - 1) / Math.floor(MAX_ITERATIONS/2) - 1);
      // }

      const off = (y * imageData.width + x) * 4;
      pixels[off] = r;
      pixels[off + 1] = g;
      pixels[off + 2] = b;
      pixels[off + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function zoomIn(centerX, centerY) {
  console.log('Point: ' + centerX + ' + ' + centerY + 'i');
  const newWidth = (maxReal - minReal) / ZOOM_FACTOR;
  const newHeight = (maxImaginary - minImaginary) / ZOOM_FACTOR;
  minReal = centerX - (newWidth / 2);
  maxReal = minReal + newWidth;
  minImaginary = centerY - (newHeight / 2);
  setWindowSize();
}

function setWindowSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  maxImaginary = minImaginary + (maxReal - minReal)*canvas.height/canvas.width;
  realFactor = (maxReal-minReal)/(canvas.width-1);
  imaginaryFactor = (maxImaginary-minImaginary)/(canvas.height-1);
  calculateImage();
}

let timeout;
const delay = 250;

window.addEventListener('resize', () => {
  clearTimeout(timeout);
  timeout = setTimeout(setWindowSize, delay);
});
