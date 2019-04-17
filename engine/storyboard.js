module.exports = level => {
  let gameTime = 0
  const actions = []

  // we're passed in the time to add since the last action,
  // rather than the absolute time
  level((time, action) => {
    gameTime += time
    actions.push({
      action,
      gameTime
    })
  })

  let lastGameTime = 0
  return {
    tick: ctx => {
      const actionsToExecute = actions.filter(x => {
        return x.gameTime > lastGameTime && x.gameTime <= ctx.gameTime
      })
      actionsToExecute.forEach(x => {
        x.action(ctx)
      })
      lastGameTime = ctx.gameTime
    }
  }
}
