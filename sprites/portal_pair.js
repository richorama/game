const et = require('eventthing')
const applyGravity = require('../engine/gravity_field')
const drawWell = require('./well_graphic')

module.exports = (props = {}) => {
  const { duration = 22000, phase = 0 } = props
  let age = 0
  const positions = () => {
    const orbit = Math.min(145, window.innerWidth * 0.2, window.innerHeight * 0.18)
    const angle = phase + age / 2600
    const dx = Math.cos(angle) * orbit
    const dy = Math.sin(angle) * orbit
    const x = window.innerWidth * 0.5
    const y = window.innerHeight * 0.43
    return { black: [x + dx, y + dy], white: [x - dx, y - dy] }
  }

  const instance = {
    getPositions: positions,
    update: (ctx, layers) => {
      age += ctx.timeSinceLastFrame
      if (age >= duration) return instance.removeFromLayer()
      if (age < 1500) return
      const { black, white } = positions()
      applyGravity(ctx, layers, {
        position: black, radius: 24, range: 320, strength: 2400,
        enter: sprite => {
          if (!sprite.teleport || (sprite.portalCooldownUntil || 0) > ctx.gameTime) return false
          const extent = sprite.getExtent()
          const angle = Math.atan2(white[1] - black[1], white[0] - black[0])
          const direction = [Math.cos(angle), Math.sin(angle)]
          const distance = 24 + extent.radius + 22
          const margin = Math.min(extent.radius + 6, window.innerWidth / 2, window.innerHeight / 2)
          const exit = [
            Math.max(margin, Math.min(window.innerWidth - margin, white[0] + direction[0] * distance)),
            Math.max(margin, Math.min(window.innerHeight - margin, white[1] + direction[1] * distance))
          ]
          sprite.teleport(exit, direction)
          sprite.portalCooldownUntil = ctx.gameTime + 1400
          et.fire('portal_transit', { position: exit, colour: '#c7ffff' })
          return true
        }
      })
      applyGravity(ctx, layers, {
        position: white, radius: 24, range: 300, strength: 2000, repel: true
      })
    },
    render: ctx => {
      const { black, white } = positions()
      ctx.buffer.save()
      ctx.buffer.globalAlpha = 0.2
      ctx.buffer.strokeStyle = '#b7caff'
      ctx.buffer.lineWidth = 1
      ctx.buffer.beginPath()
      ctx.buffer.moveTo(...black)
      ctx.buffer.lineTo(...white)
      ctx.buffer.stroke()
      ctx.buffer.restore()
      drawWell(ctx, { position: black, age, remaining: duration - age, label: 'IN / BLACK HOLE' })
      drawWell(ctx, { position: white, age, remaining: duration - age, white: true, label: 'OUT / WHITE HOLE' })
    }
  }
  return instance
}
