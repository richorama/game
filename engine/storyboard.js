
const timers = []
module.exports.play = level => {
  let gameTime = 0;
  level((time, action) => {
    gameTime += time
    console.log('adding')
    timers.push(setTimeout(action, gameTime))
  })
}