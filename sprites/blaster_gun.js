const Beam = require('./beam')
const et = require('eventthing')

const img = new Image()
img.src = 'svg/gattling-gun.svg'

module.exports = props => {
  const { rate, velocity, offset, damage } = props
  const [dx, dy] = offset

  let previous = null
  let lastSegment = null
  let nextShot = 0
  let heat = 0
  let overheated = false
  let lastUpdate = null
  const cool = (ctx, firing = false) => {
    if (lastUpdate !== null && (overheated || !firing)) {
      heat = Math.max(0, heat - (ctx.gameTime - lastUpdate) * 0.055)
    }
    if (overheated && heat <= 20) overheated = false
    lastUpdate = ctx.gameTime
  }
  return {
    getHeat: () => heat,
    isOverheated: () => overheated,
    fire: ctx => {
      cool(ctx, true)
      if (overheated) {
        previous = null
        lastSegment = null
        return []
      }
      const position = ctx.ship.getPosition()
      const now = ctx.gameTime
      if (!previous || now - previous.time > ctx.timeSinceLastFrame + 0.01) {
        previous = { position, time: now }
        lastSegment = null
        nextShot = now
      }
      const shots = []
      while (nextShot <= now) {
        const elapsed = now - previous.time
        const t = elapsed > 0 ? (nextShot - previous.time) / elapsed : 1
        const x = previous.position[0] + (position[0] - previous.position[0]) * t
        const y = previous.position[1] + (position[1] - previous.position[1]) * t
        const segment = Beam({
          position: [x + dx + 5, y + dy - 50],
          velocity, colour: '#d994ff', damage, radius: 6,
          age: now - nextShot, createdAt: now, previous: lastSegment
        })
        shots.push(segment)
        lastSegment = segment
        nextShot += rate
        heat = Math.min(100, heat + 2)
        if (heat === 100) {
          overheated = true
          break
        }
      }
      previous = { position, time: now }
      if (shots.length) et.fire('weapon_fire', {
        kind: 'beam', colour: '#d994ff', position: [position[0] + dx + 5, position[1] + dy - 50]
      })
      return shots
    },
    render: ctx => {
      cool(ctx)
      if (ctx.ship.isDestroyed()) return
      const [x, y] = ctx.ship.getPosition()

      ctx.buffer.translate(x, y)
      ctx.buffer.rotate(-Math.PI / 2)
      ctx.buffer.drawImage(img, -20, 10, 50, 50)
      ctx.buffer.rotate(Math.PI / 2)
      ctx.buffer.translate(-x, -y)
    }
  }
}
