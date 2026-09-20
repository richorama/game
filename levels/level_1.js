const et = require('eventthing')
const Spider = require('../sprites/spider_enemy')
const Boss = require('../sprites/boss_enemy')
const Drone = require('../sprites/drone_enemy')
const { enemy: createEnemy, pickup: createUpgrade, beetle, wasps: createWasps } = require('./spawns')
const weapons = require('./weapons')
const unlocks = { 1: weapons.spread, 2: weapons.twin, 3: weapons.beam, 5: weapons.seeker, 7: weapons.rear }

const support = [
  { shield: 40, text: '+ SHIELD' },
  { energy: 35, text: '+ REPAIR' },
  { speedup: 60, text: '+ ENGINE BOOST' },
  { shield: 50, text: '+ SHIELD' },
  { energy: 40, text: '+ REPAIR' },
  { shield: 50, text: '+ SHIELD' },
  { energy: 50, text: '+ REPAIR' },
  { speedup: 40, text: '+ ENGINE BOOST' },
  { shield: 60, text: '+ SHIELD' }
]

module.exports = add => {
  for (let wave = 1; wave <= 9; wave++) {
    add(wave === 1 ? 1000 : 8000, () => {
      et.fire('wave', { number: wave, total: 9 })
      if (wave === 1) {
        createEnemy(beetle(0.5))
      } else {
        createEnemy(beetle(0.3))
        createEnemy(beetle(0.7))
      }
      if (wave >= 4) {
        createEnemy(Spider({
          position: [wave % 2 ? 0 : window.innerWidth, 0],
          speed: 35, radius: 30, colour: '#ff789e', energy: 80, rate: 2200
        }))
      }
      if (wave >= 6) createEnemy(beetle(0.5, true))
    })
    add(2000, () => {
      if (unlocks[wave]) {
        const upgrade = unlocks[wave]()
        createUpgrade({ ...upgrade, text: '+ ' + upgrade.name.toUpperCase() })
      } else {
        createUpgrade({ energy: 50, text: '+ REPAIR' })
      }
    })
    add(4000, () => {
      if (wave === 1) createEnemy(beetle(0.5))
      if (wave >= 2) {
        createWasps(Math.min(4, Math.floor(wave / 2)))
      }
      if (wave >= 6) createEnemy(beetle(0.2))
      if (wave === 9) createEnemy(beetle(0.8, true))
      if ([4, 7, 9].includes(wave)) createEnemy(Drone({
        position: [window.innerWidth * 0.5, -60]
      }))
      if ([5, 7, 9].includes(wave)) et.fire('create_black_hole', {
        position: [window.innerWidth * (wave === 7 ? 0.65 : 0.35), window.innerHeight * 0.4]
      })
    })
    add(4000, () => createUpgrade(support[wave - 1]))
    add(4000, () => {
      createEnemy(beetle(0.2))
      createEnemy(beetle(0.8))
    })
    add(8000, () => {
      createEnemy(beetle(0.5, wave >= 7))
      if (wave >= 3) createWasps(2)
      if (wave >= 5) createEnemy(Drone({
        position: [window.innerWidth * (wave % 2 ? 0.3 : 0.7), -60]
      }))
      if (wave % 2 === 0) createUpgrade({ energy: 25, text: '+ FIELD REPAIR' }, 0.65)
    })
  }
  add(8000, () => {
    createEnemy(Boss())
    et.fire('boss_arrival', 'HIVE QUEEN')
    createUpgrade({ energy: 50, shield: 50, text: '+ BOSS SUPPLIES' })
  })
}
