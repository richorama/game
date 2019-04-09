const Bullet = require('./bullet')
const twopi = 2 * Math.PI
const et = require('eventthing')
const maths = require('../engine/maths')

module.exports = props => {
  let { position, speed, radius, colour, energy, rate } = props
  let [x, y] = position
  let damageInflicted = false
  let lastFired = 0
  let lastShipPosition = [x,y]
  const calculatePosition = ctx => {
    lastShipPosition = ctx.ship.getPosition()
    const newHeading = maths.calculateTrajectory(
      [x, y],
      lastShipPosition,
      speed / ctx.timeSinceLastFrame
    )
    x += newHeading[0]
    y += newHeading[1]
  }

  const instance = {
    hit: sprite => {
      energy -= sprite.getDamage()
      if (energy <= 0) {
        const explosionHeading = maths.calculateTrajectory(
          [x, y],
          lastShipPosition,
          speed
        )
        et.fire('explosion', { position: [x, y], velocity: explosionHeading })
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
            velocity: maths.calculateTrajectory([x, y], shipPosition, 200),
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
