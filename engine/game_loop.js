module.exports = callback => {
  const gameStart = new Date().getTime()
  let lastFrame = new Date().getTime()
  const viewportCanvas = document.getElementById('canvas');
  const viewportContext = viewportCanvas.getContext('2d', { alpha: false });

  const bufferCanvas = document.createElement('canvas');
  const bufferContext = bufferCanvas.getContext('2d', { alpha: false });
  let horizonX = 0;
  let horizonY = 0;
  // resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false);
  function resizeCanvas() {
    viewportCanvas.width = window.innerWidth;
    viewportCanvas.height = window.innerHeight;
    bufferCanvas.width = window.innerWidth;
    bufferCanvas.height = window.innerHeight;
    horizonX = window.innerWidth / 2;
    horizonY = window.innerHeight / 2;
  }
  resizeCanvas();

  /*
  let frameCount = 0;
  let fps = 0;
  setInterval(() => {
    console.log(`${frameCount} fps`);
    fps = frameCount;
    frameCount = 0;
  }, 1000)
  */

  window.requestAnimationFrame(drawFrame);
  function drawFrame() {
    // frameCount++;

    bufferContext.fillStyle = 'rgb(0, 0, 0)';
    bufferContext.fillRect(0, 0, viewportCanvas.width, viewportCanvas.height);

    const now = new Date().getTime()
    callback({
      buffer: bufferContext,
      gameTime: now - gameStart,
      timeSinceLastFrame: now - lastFrame
    });
    lastFrame = now

    // swap the buffer for the viewport
    viewportContext.drawImage(bufferCanvas, 0, 0);
    window.requestAnimationFrame(drawFrame);
  }
}