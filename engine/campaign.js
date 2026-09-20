const Storyboard = require('./storyboard')
const et = require('eventthing')

module.exports = levels => {
  let round
  let storyboard
  let startedAt
  let now
  let nextRoundAt
  let bossActive
  let complete
  const reset = () => {
    round = 0
    storyboard = Storyboard(levels[0])
    startedAt = 0
    now = 0
    nextRoundAt = null
    bossActive = false
    complete = false
  }
  reset()
  return {
    reset,
    getRound: () => round + 1,
    isTransitioning: () => nextRoundAt !== null,
    isComplete: () => complete,
    bossArrived: () => { if (!complete && nextRoundAt === null) bossActive = true },
    bossDefeated: () => {
      if (!bossActive || complete || nextRoundAt !== null) return false
      bossActive = false
      if (round === levels.length - 1) {
        complete = true
        et.fire('level_complete')
      } else {
        nextRoundAt = now + 4000
        et.fire('round_complete', { number: round + 1 })
      }
      return true
    },
    tick: ctx => {
      now = ctx.gameTime
      if (complete) return
      if (nextRoundAt !== null) {
        if (now < nextRoundAt) return
        round++
        startedAt = nextRoundAt
        nextRoundAt = null
        storyboard = Storyboard(levels[round])
        et.fire('round_started', { number: round + 1, total: levels.length })
      }
      storyboard.tick({ ...ctx, gameTime: now - startedAt })
    }
  }
}
