const Bullet = require('./bullet')
const twopi = 2 * Math.PI
const et = require('eventthing')
const maths = require('../engine/maths')

const img = new Image()
img.src = 'svg/noun_stag beetle_720017.svg'

module.exports = props => {
  let { position, speed, radius, colour, energy, rate } = props
  let [x, y] = position
  let lastFired = 0
  let lastShipPosition = [x, y]
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
      const explosionHeading = maths.calculateTrajectory(
        [x, y],
        lastShipPosition,
        speed
      )
      if (energy <= 0) {
        et.fire('explosion', {
          position: [x, y],
          velocity: explosionHeading,
          colour,
          size: 1
        })
        instance.removeFromLayer()
        return
      }
      et.fire('explosion', {
        position: [x, y],
        velocity: explosionHeading,
        colour,
        size: 0.1
      })
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
            colour: '#fff',
            damage: 5
          })
        ]
      }
    },
    render: ctx => {
      calculatePosition(ctx)
      const angle =
        maths.calculateHeading([x, y], ctx.ship.getPosition()) + Math.PI * 0.5

      ctx.buffer.translate(x, y)
      ctx.buffer.rotate(angle)
      ctx.buffer.drawImage(img, -40, -40, 80, 80)
      ctx.buffer.rotate(-angle)
      ctx.buffer.translate(-x, -y)
    }
  }
  return instance
}
