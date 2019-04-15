const et = require('eventthing')
const width = 25
const height = 25
const colour = 'rgb(152, 195, 121)'

module.exports = props => {
  let { x, y, maxSpeed, energy } = props
  let damageInflicted = false
  let keys = {}
  et.on('keychange', newKeys => (keys = newKeys))
  et.on('upgrade', upgrade => {
    if (upgrade.speedup) maxSpeed += upgrade.speedup
    if (upgrade.energy) {
      energy += upgrade.energy
      energy = Math.max(0, Math.min(100, energy))
    }
  })

  const calculatePosition = dt => {
    let newX = x
    let newY = y
    if (keys.ArrowLeft && !keys.ArrowRight) newX -= maxSpeed / dt
    if (keys.ArrowRight && !keys.ArrowLeft) newX += maxSpeed / dt
    if (keys.ArrowUp && !keys.ArrowDown) newY -= maxSpeed / dt
    if (keys.ArrowDown && !keys.ArrowUp) newY += maxSpeed / dt
    if (newX > width / 2 && newX + width / 2 <= window.innerWidth) x = newX
    if (newY > height / 2 && newY + height / 2 <= window.innerHeight) y = newY
  }

  const instance = {
    hit: sprite => {
      energy -= sprite.getDamage()
      energy = Math.max(0, Math.min(100, energy))
      if (energy <= 0) {
        et.fire('explosion', { position: [x, y], velocity: [0, 0], colour })
        et.fire('death')
        instance.removeFromLayer()
      }
      damageInflicted = true
    },
    getHealth: () => energy,
    getDamage: () => 100000,
    getExtent: () => {
      return {
        x,
        y,
        radius: 12.5
      }
    },
    getPosition: () => [x, y],
    getDimensions: () => [width, height],
    render: ctx => {
      calculatePosition(ctx.timeSinceLastFrame)
      ctx.buffer.fillStyle = damageInflicted ? 'white' : colour
      ctx.buffer.fillRect(x - width / 2, y - width / 2, width, height)
      damageInflicted = false
    }
  }
  return instance
}
