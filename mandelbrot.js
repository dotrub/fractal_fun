let canvas, ctx;
const START_MIN_REAL = -2, START_MAX_REAL = 1, START_MIN_IMAG = -1.2, START_MAX_IMAG = 1.2;
let minReal = START_MIN_REAL, maxReal = START_MAX_REAL, minImaginary = START_MIN_IMAG, maxImaginary, realFactor, imaginaryFactor;
const ZOOM_FACTOR = 10;

const MAX_ITERATIONS = 1000;
const THRESHOLD_2 = Math.floor(MAX_ITERATIONS/10);
const THRESHOLD_1 = 50;

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

// scaleSize must be at least 2
// n is zero indexed
// color params are arrays with length 3
const calculateColorShift = (fromColor, toColor, n, scaleSize) => {
  const [fR, fG, fB] = fromColor;
  const [tR, tG, tB] = toColor;
  let r, g, b;
  const shiftFactor = n / (scaleSize - 1);
  r = fR + ((tR - fR) * shiftFactor);
  g = fG + ((tG - fG) * shiftFactor);
  b = fB + ((tB - fB) * shiftFactor);
  return [r, g, b];
}

function calculateImage() {
  ctx = canvas.getContext('2d');
  // console.log('canvas.height: ' + canvas.height)
  // console.log('canvas.width: ' + canvas.width)

  console.log('minReal: ' + minReal)
  console.log('maxReal: ' + maxReal)
  console.log('minImaginary: ' + minImaginary)
  console.log('maxImaginary: ' + maxImaginary)
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
      } else if (lastIteration < THRESHOLD_1) {
        [r, g, b] = calculateColorShift([1,1,28], [10,10,150], lastIteration, THRESHOLD_1);
      } else if (lastIteration >= THRESHOLD_1 && lastIteration < THRESHOLD_2) {
        [r, g, b] = calculateColorShift([0,0,0], [175,0,0], lastIteration - THRESHOLD_1, THRESHOLD_2 - THRESHOLD_1);
      } else if (lastIteration >= THRESHOLD_2 && lastIteration < MAX_ITERATIONS) {
        [r, g, b] = calculateColorShift([175,0,0], [0,175,127], lastIteration - THRESHOLD_2, MAX_ITERATIONS - THRESHOLD_2);
      }

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
  const aspectRatio = canvas.height/canvas.width;

  maxImaginary = minImaginary + ((maxReal - minReal)*aspectRatio);
  if (maxReal - minReal >= 3) {
    if (maxImaginary < START_MAX_IMAG) {
      maxImaginary = START_MAX_IMAG;
      maxReal = minReal + ((maxImaginary - minImaginary) / aspectRatio);

      // slide real axis to center x=-0.5
      const realWidth = maxReal - minReal;
      minReal = minReal - ((realWidth - 3) / 2);
      maxReal = maxReal - ((realWidth - 3) / 2);
    } else {
      // // slide imaginary axis to center y=0
      const imagWidth = maxImaginary - minImaginary;
      minImaginary = minImaginary - ((imagWidth - 2.4) / 2);
      maxImaginary = maxImaginary - ((imagWidth - 2.4) / 2);
    }
  }
  realFactor = (maxReal-minReal)/(canvas.width-1);
  imaginaryFactor = (maxImaginary-minImaginary)/(canvas.height-1);
  calculateImage();
}

let timeout;
const delay = 250;

window.addEventListener('resize', () => {
  clearTimeout(timeout);
  minReal = START_MIN_REAL;
  maxReal = START_MAX_REAL;
  minImaginary = START_MIN_IMAG;
  timeout = setTimeout(setWindowSize, delay);
});
