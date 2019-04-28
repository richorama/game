const Bullet = require('./bullet')
const et = require('eventthing')
const maths = require('../engine/maths')

const img = new Image()
img.src = 'svg/noun_tarantula_734014.svg'

module.exports = props => {
  let { position, speed, radius, colour, energy, rate } = props
  let [x, y] = position
  let lastFired = 0
  let targetLocation = [window.innerWidth / 2, window.innerHeight / 2]
  const calculatePosition = ctx => {
    const newHeading = maths.calculateTrajectory(
      [x, y],
      targetLocation,
      speed / ctx.timeSinceLastFrame
    )
    x += newHeading[0]
    y += newHeading[1]
  }
  let spriteTime = 0

  const instance = {
    hit: sprite => {
      energy -= sprite.getDamage()
      const explosionHeading = maths.calculateTrajectory(
        [x, y],
        targetLocation,
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
      if (spriteTime < 3000) return
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
      spriteTime += ctx.timeSinceLastFrame
      if (spriteTime < 3000) calculatePosition(ctx)
      const angle =
        maths.calculateHeading(
          [x, y],
          [window.innerWidth / 2, window.innerHeight / 2]
        ) +
        Math.PI * 0.5

      ctx.buffer.translate(x, y)
      ctx.buffer.rotate(angle)
      ctx.buffer.drawImage(img, -40, -40, 80, 80)
      ctx.buffer.rotate(-angle)
      ctx.buffer.translate(-x, -y)
    }
  }
  return instance
}
