const et = require('eventthing')
const width = 25
const height = 25

module.exports = props => {
  let { x, y, maxSpeed, energy } = props
  let damageInflicted = false
  let keys = {}
  et.on('keychange', newKeys => (keys = newKeys))

  const calculatePosition = dt => {
    let newX = x
    let newY = y
    if (keys.ArrowLeft && !keys.ArrowRight) newX -= maxSpeed / dt
    if (keys.ArrowRight && !keys.ArrowLeft) newX += maxSpeed / dt
    if (keys.ArrowUp && !keys.ArrowDown) newY -= maxSpeed / dt
    if (keys.ArrowDown && !keys.ArrowUp) newY += maxSpeed / dt
    if (newX > 0 && newX + width <= window.innerWidth) x = newX
    if (newY > 0 && newY + height <= window.innerHeight) y = newY
  }

  return {
    hit: sprite => {
      energy -= sprite.getDamage()
      if (energy <= 0) instance.removeFromLayer()
      damageInflicted = true
    },
    getDamage: () => 100000,
    getExtent: () => {
      return {
        x,
        y,
        radius: 12.5
      }
    },
    getPosition: () => [x + width / 2, y + height / 2],
    getDimensions: () => [width, height],
    render: ctx => {
      calculatePosition(ctx.timeSinceLastFrame)
      ctx.buffer.fillStyle = damageInflicted ? 'white' : '#cccccc'
      ctx.buffer.fillRect(x, y, width, height)
    }
  }
}
