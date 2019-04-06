const et = require('eventthing')
const keyboard = require('../engine/keyboard')
const width = 25
const height = 25

module.exports = props => {
  let { x, y, maxSpeed } = props
  let keys = {}
  const getKeyboardState = () => {
    keys = keyboard.keyStates()
  }
  et.on('keydown', getKeyboardState)
  et.on('keyup', getKeyboardState)

  const calculatePosition = dt => {
    let newX = x
    let newY = y
    if (keys.ArrowLeft && !keys.ArrowRight) newX = x - maxSpeed / dt
    if (keys.ArrowRight && !keys.ArrowLeft) newX = x + maxSpeed / dt
    if (keys.ArrowUp && !keys.ArrowDown) newY = y - maxSpeed / dt
    if (keys.ArrowDown && !keys.ArrowUp) newY = y + maxSpeed / dt
    if (newX < 0 || newX + width > window.innerWidth) return
    if (newY < 0 || newY + height > window.innerHeight) return
    x = newX
    y = newY
  }

  return {
    render: ctx => {
      calculatePosition(ctx.timeSinceLastFrame)
      ctx.buffer.fillStyle = '#cccccc'
      ctx.buffer.fillRect(x, y, width, height)
    }
  }

}