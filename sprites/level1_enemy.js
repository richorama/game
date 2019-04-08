const Bullet = require('./bullet')
const twopi = 2 * Math.PI
const et = require('eventthing')

function calculateTrajectory(source, target, speed) {
  const heading = Math.atan2(target[1] - source[1], target[0] - source[0])
  return [speed * Math.cos(heading), speed * Math.sin(heading)]
}

module.exports = props => {
  let { position, speed, radius, colour, energy, rate } = props
  let [x, y] = position
  let damageInflicted = false
  let lastFired = 0
  let lastHeading = [0, 0]
  const calculatePosition = ctx => {
    const newHeading = calculateTrajectory(
      [x, y],
      ctx.ship.getPosition(),
      speed / ctx.timeSinceLastFrame
    )
    x += newHeading[0]
    y += newHeading[1]
    lastHeading = newHeading
  }

  const instance = {
    hit: sprite => {
      energy -= sprite.getDamage()
      if (energy <= 0) {
        et.fire('explosion', { position: [x, y], velocity: lastHeading })
        instance.removeFromLayer()
      }
      damageInflicted = true
    },
    getDamage: () => energy,
    getExtent: () => {
      return {
        x,
        y,
        radius
      }
    },
    fire: ctx => {
      const elapsedTime = ctx.gameTime - lastFired
      if (elapsedTime >= rate) {
        lastFired = ctx.gameTime
        const shipPosition = ctx.ship.getPosition()
        return [
          Bullet({
            position: [x, y],
            velocity: calculateTrajectory([x, y], shipPosition, 200),
            radius: 5,
            colour: '#fff'
          })
        ]
      }
    },
    render: ctx => {
      calculatePosition(ctx)
      ctx.buffer.fillStyle = damageInflicted ? 'white' : colour
      ctx.buffer.beginPath()
      ctx.buffer.arc(x, y, radius, 0, twopi)
      ctx.buffer.fill()
      damageInflicted = false
    }
  }
  return instance
}
