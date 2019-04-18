const constants = require('../engine/constants')
const et = require('eventthing')
const width = 25
const height = 25
const colour = 'rgb(152, 195, 121)'
const twopi = 2 * Math.PI
const maths = require('../engine/maths')
const lightRadius = 300

const img = new Image()
img.src = 'svg/space-ship.svg'

module.exports = props => {
  let { x, y, maxSpeed, energy } = props
  let destroyed = false
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
    if (newX > width / 2 && newX + width / 2 <= constants.width) x = newX
    if (newY > height / 2 && newY + height / 2 <= constants.height) y = newY
  }

  const instance = {
    hit: sprite => {
      if (destroyed) return
      energy -= sprite.getDamage()
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
    },
    getPosition: () => [x, y],
    getDimensions: () => [width, height],
    render: ctx => {
      if (destroyed) return

      calculatePosition(ctx.timeSinceLastFrame)
      instance.renderLighting(ctx)
      ctx.buffer.drawImage(img, x - 30, y - 30, 60, 60)
    },

    // radial gradient
    renderLighting: ctx => {
      const lightingExtent = {
        x,
        y,
        radius: lightRadius
      }
      let regions = [
        {
          from: -Math.PI,
          to: Math.PI,
          radius: lightRadius
        }
      ]
      const enemySegments = ctx.enemies
        .map(e => e.getExtent())
        .filter(e => maths.overlap(e, lightingExtent))
        .map(e => {
          const heading = maths.calculateHeading([x, y], [e.x, e.y])
          const distance = maths.distance(lightingExtent, e)
          const radius = Math.sqrt(
            Math.pow(distance, 2) + Math.pow(e.radius, 2)
          )
          const theta = Math.asin(e.radius / distance)
          return {
            theta,
            radius,
            from: heading - theta,
            to: heading + theta
          }
        })
      const wrapped = enemySegments.filter(e => e.from > e.to)
      if (wrapped.length > 0) console.log(wrapped)

      enemySegments
        .sort((a, b) => b.radius - a.radius)
        .forEach(e => {
          regions.forEach(r => {
            // we are completely in front of an existing region
            if (e.from < r.from && e.to > r.to) {
              regions = regions.filter(p => p !== r)
              return
            }

            // probably need to add a case here when we're in front of the
            // region, but both sides are visible
            if (r.from < e.from && r.to > e.to) {
              regions.push({
                from: e.to,
                to: r.to,
                radius: r.radius
              })
              r.to = e.from
              return
            }

            if (e.from > r.from && e.from < r.to) {
              r.to = e.from // alter the region, as we're partly covering it
              return
            }

            if (e.to > r.from && e.to < r.to) {
              r.from = e.to // alter the region, as we're partly covering it
              return
            }
          })
          regions.push(e)
        })

      const gradient = ctx.buffer.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        lightRadius
      )
      gradient.addColorStop(0, '#333')
      gradient.addColorStop(1, '#000')

      ctx.buffer.globalCompositeOperation = 'lighter'
      regions
        .sort((a, b) => a.from - b.from)
        .forEach(e => {
          ctx.buffer.beginPath()
          ctx.buffer.fillStyle = gradient
          ctx.buffer.moveTo(x, y)
          ctx.buffer.arc(x, y, e.radius, e.from, e.to)
          ctx.buffer.moveTo(x, y)
          ctx.buffer.fill()
        })
      ctx.buffer.globalCompositeOperation = 'source-over'
    }
  }
  return instance
}
