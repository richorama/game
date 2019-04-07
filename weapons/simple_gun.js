const Bullet = require('../sprites/bullet')

module.exports = props => {
  const { rate, velocity, offset } = props
  const [dx, dy] = offset

  let lastFired = 0
  return {
    fire: ctx => {
      const elapsedTime = ctx.gameTime - lastFired
      if (elapsedTime >= rate) {
        lastFired = ctx.gameTime
        const [x, y] = ctx.ship.getPosition()
        return [Bullet({
          position: [x + dx, y + dy],
          velocity: velocity,
          radius: 5,
          colour: '#fff'
        })]
      }
    }

  }
}