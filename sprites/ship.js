const et = require('eventthing')
const GravityMotion = require('../engine/gravity_motion')
const width = 25
const height = 25
const colour = 'rgb(152, 195, 121)'

const img = new Image()
img.src = 'svg/interceptor.svg'

module.exports = props => {
  let { x, y, maxSpeed, energy } = props
  let destroyed = false
  let invulnerability = 0
  let shield = 0
  let keys = {}
  const gravity = GravityMotion()
  et.on('keychange', newKeys => (keys = newKeys))
  et.on('upgrade', upgrade => {
    if (upgrade.speedup) maxSpeed = Math.min(500, maxSpeed + upgrade.speedup)
    if (upgrade.shield) shield = Math.min(100, shield + upgrade.shield)
    if (upgrade.energy) {
      energy += upgrade.energy
      energy = Math.max(0, Math.min(100, energy))
    }
  })

  const calculatePosition = dt => {
    const [pullX, pullY] = gravity.step(dt)
    let newX = x + pullX
    let newY = y + pullY
    if (keys.ArrowLeft && !keys.ArrowRight) newX -= maxSpeed * dt / 1000
    if (keys.ArrowRight && !keys.ArrowLeft) newX += maxSpeed * dt / 1000
    if (keys.ArrowUp && !keys.ArrowDown) newY -= maxSpeed * dt / 1000
    if (keys.ArrowDown && !keys.ArrowUp) newY += maxSpeed * dt / 1000
    x = Math.max(30, Math.min(window.innerWidth - 30, newX))
    y = Math.max(30, Math.min(window.innerHeight - 30, newY))
  }

  const instance = {
    isPlayer: true,
    teleportVersion: 0,
    accelerate: gravity.accelerate,
    teleport: position => {
      x = Math.max(30, Math.min(window.innerWidth - 30, position[0]))
      y = Math.max(30, Math.min(window.innerHeight - 30, position[1]))
      gravity.reset()
      invulnerability = Math.max(invulnerability, 900)
      instance.teleportVersion++
    },
    hit: sprite => {
      if (destroyed || invulnerability > 0 || sprite.getDamage() === 0) return
      const damage = sprite.getDamage()
      const absorbed = Math.min(shield, damage)
      shield -= absorbed
      energy -= damage - absorbed
      invulnerability = 650
      et.fire('ship_hit')
      energy = Math.max(0, Math.min(100, energy))
      if (energy <= 0) {
        et.fire('explosion', {
          position: [x, y],
          velocity: [0, 0],
          colour,
          size: 5
        })
        et.fire('death')
        destroyed = true
      } else {
        et.fire('explosion', {
          position: [x, y],
          velocity: [0, 0],
          colour,
          size: 0.1
        })
      }
    },
    getHealth: () => energy,
    getShield: () => shield,
    isDestroyed: () => destroyed,
    getDamage: () => 100000,
    getExtent: () => {
      return {
        x,
        y,
        radius: 25
      }
    },
    recreate: () => {
      destroyed = false
      energy = 100
      shield = 0
      invulnerability = 0
      maxSpeed = props.maxSpeed
      x = window.innerWidth * 0.5
      y = window.innerHeight * 0.7
      keys = {}
      gravity.reset()
      instance.teleportVersion = 0
      instance.portalCooldownUntil = 0
    },
    getPosition: () => [x, y],
    getDimensions: () => [width, height],
    render: ctx => {
      if (destroyed) return
      invulnerability = Math.max(0, invulnerability - ctx.timeSinceLastFrame)
      calculatePosition(ctx.timeSinceLastFrame)
      ctx.buffer.save()
      ctx.buffer.shadowColor = '#65e8ff'
      ctx.buffer.shadowBlur = 18
      if (shield > 0) {
        ctx.buffer.strokeStyle = '#65e8ff'
        ctx.buffer.lineWidth = 3
        ctx.buffer.beginPath()
        ctx.buffer.arc(x, y, 35, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * shield / 100)
        ctx.buffer.stroke()
      }
      ctx.buffer.fillStyle = '#497dff'
      ctx.buffer.beginPath()
      ctx.buffer.moveTo(x - 12, y + 22)
      ctx.buffer.lineTo(x, y + 68 + Math.sin(ctx.gameTime / 45) * 12)
      ctx.buffer.lineTo(x + 12, y + 22)
      ctx.buffer.fill()
      ctx.buffer.fillStyle = '#c7f8ff'
      ctx.buffer.beginPath()
      ctx.buffer.moveTo(x - 5, y + 22)
      ctx.buffer.lineTo(x, y + 48 + Math.sin(ctx.gameTime / 45) * 6)
      ctx.buffer.lineTo(x + 5, y + 22)
      ctx.buffer.fill()
      if (invulnerability > 0) ctx.buffer.globalAlpha = 0.5 + Math.sin(ctx.gameTime / 40) * 0.25
      ctx.buffer.drawImage(img, x - 32, y - 36, 64, 72)
      ctx.buffer.restore()
    }
  }
  return instance
}
