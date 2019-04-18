const level1Art = require('../ascii/level_1').split('\n')
const constants = require('../engine/constants')
const width =
  12 * level1Art.reduce((acc, value) => Math.max(acc, value.length), 1)
const height = 22
const initialPosition = constants.height - (level1Art.length * height)

module.exports = props => {
  return {
    render: ctx => {
      ctx.buffer.fillStyle = '#444'
      ctx.buffer.font = '20px Monospace'
      let y = initialPosition + ctx.gameTime / 50
      var windowHeight = constants.height

      level1Art.forEach(line => {
        let changedColour = false
        y += height
        if (y + height <= 0) return
        if (y - height > windowHeight) return
        let x = (constants.width - width) / 2
        if (Math.floor(Math.random() * 1500) === 1) x += Math.random() * 100 - 50
        if (Math.floor(Math.random() * 1500) === 1) {
          ctx.buffer.fillStyle = `rgb(${Math.floor(
            Math.random() * 255
          )}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
            Math.random() * 255
          )})`
          changedColour = true
        }
        ctx.buffer.fillText(line, x, y)
        if (changedColour) ctx.buffer.fillStyle = '#444'
      })

      ctx.buffer.font = '20px Orbitron'
    }
  }
}
