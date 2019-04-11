
const timers = []
module.exports.play = level => {
  let gameTime = 0;
  level((time, action) => {
    gameTime += time
    timers.push(setTimeout(action, gameTime))
  })
}