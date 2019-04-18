
const constants = require('./constants')

module.exports = callback => {
  const gameStart = new Date().getTime()
  let lastFrame = new Date().getTime()
  const viewportCanvas = document.getElementById('canvas')
  const viewportContext = viewportCanvas.getContext('2d', { alpha: false })

  const bufferCanvas = document.createElement('canvas')
  const bufferContext = bufferCanvas.getContext('2d', { alpha: false })
  // resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false)
  function resizeCanvas() {
    viewportCanvas.width = constants.width
    viewportCanvas.height = constants.height
    bufferCanvas.width = constants.width
    bufferCanvas.height = constants.height
  }
  resizeCanvas()

  let frameCount = 0
  setInterval(() => {
    console.log(`${frameCount} fps`)
    frameCount = 0
  }, 1000)

  window.requestAnimationFrame(drawFrame)
  function drawFrame() {
    frameCount++
    bufferContext.font = '20px Orbitron'
    bufferContext.fillStyle = 'rgb(40, 44, 52)'
    bufferContext.fillRect(0, 0, viewportCanvas.width, viewportCanvas.height)

    const now = new Date().getTime()
    callback({
      buffer: bufferContext,
      gameTime: now - gameStart,
      timeSinceLastFrame: now - lastFrame
    })
    lastFrame = now

    // swap the buffer for the viewport
    viewportContext.drawImage(bufferCanvas, 0, 0)
    window.requestAnimationFrame(drawFrame)
  }
}
