const Beam = require('./beam')

const img = new Image()
img.src = 'svg/gattling-gun.svg'

module.exports = props => {
  const { rate, velocity, offset, damage } = props
  const [dx, dy] = offset

  let lastFired = 0
  return {
    fire: ctx => {
      const elapsedTime = ctx.gameTime - lastFired
      if (elapsedTime >= rate) {
        lastFired = ctx.gameTime
        const [x, y] = ctx.ship.getPosition()
        return [
          Beam({
            position: [x + dx + 5, y + dy - 50],
            velocity,
            colour: '#fff',
            damage,
            radius: damage
          })
        ]
      }
    },
    render: ctx => {
      const [x, y] = ctx.ship.getPosition()

      ctx.buffer.translate(x, y)
      ctx.buffer.rotate(-Math.PI / 2)
      ctx.buffer.drawImage(img, -20, 10, 50, 50)
      ctx.buffer.rotate(Math.PI / 2)
      ctx.buffer.translate(-x, -y)
    }
  }
}
