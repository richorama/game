module.exports = callback => {
  let gameTime = 0
  let lastFrame = performance.now()
  const viewportCanvas = document.getElementById('canvas')
  const viewportContext = viewportCanvas.getContext('2d', { alpha: false })

  const bufferCanvas = document.createElement('canvas')
  const bufferContext = bufferCanvas.getContext('2d', { alpha: false })
  let background
  // resize the canvas to fill browser window dynamically
  window.addEventListener('resize', resizeCanvas, false)
  function resizeCanvas() {
    viewportCanvas.width = window.innerWidth
    viewportCanvas.height = window.innerHeight
    bufferCanvas.width = window.innerWidth
    bufferCanvas.height = window.innerHeight
    background = bufferContext.createRadialGradient(
      window.innerWidth * 0.7, window.innerHeight * 0.25, 0,
      window.innerWidth * 0.5, window.innerHeight * 0.5,
      Math.max(window.innerWidth, window.innerHeight)
    )
    background.addColorStop(0, '#172442')
    background.addColorStop(0.45, '#10182d')
    background.addColorStop(1, '#050914')
  }
  resizeCanvas()

  window.requestAnimationFrame(drawFrame)
  function drawFrame(now) {
    bufferContext.font = '20px Orbitron'
    bufferContext.fillStyle = background
    bufferContext.fillRect(0, 0, viewportCanvas.width, viewportCanvas.height)

    const elapsed = Math.max(0, Math.min(50, now - lastFrame))
    gameTime += elapsed
    callback({
      buffer: bufferContext,
      gameTime,
      timeSinceLastFrame: elapsed
    })
    lastFrame = now

    // swap the buffer for the viewport
    viewportContext.drawImage(bufferCanvas, 0, 0)
    window.requestAnimationFrame(drawFrame)
  }
}
