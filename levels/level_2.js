const et = require('eventthing')
const { enemy, pickup, beetle, wasps } = require('./spawns')
const weapons = require('./weapons')
const Drone = require('../sprites/drone_enemy')
const RiftEnemy = require('../sprites/rift_enemy')
const Boss = require('../sprites/boss_enemy')

const unlocks = { 1: weapons.rotary, 2: weapons.flank, 3: weapons.heavy, 5: weapons.rail, 7: weapons.nova }
const riftEnemy = (lane, carrier = false) => RiftEnemy({
  position: [window.innerWidth * lane, -60], carrier
})

module.exports = add => {
  for (let wave = 1; wave <= 9; wave++) {
    add(wave === 1 ? 1000 : 8000, () => {
      et.fire('wave', { number: wave, total: 9 })
      enemy(beetle(0.25, true))
      enemy(beetle(0.75, wave >= 4))
      enemy(riftEnemy(0.5))
      if (wave >= 3) enemy(riftEnemy(wave % 2 ? 0.2 : 0.8, true))
    })
    add(2000, () => {
      const upgrade = unlocks[wave] ? unlocks[wave]() : { energy: 40, text: '+ REPAIR' }
      pickup(upgrade.weapon ? { ...upgrade, text: '+ ' + upgrade.name.toUpperCase() } : upgrade)
    })
    add(4000, () => {
      wasps(Math.min(4, 2 + Math.floor(wave / 3)))
      enemy(Drone({ position: [window.innerWidth * 0.5, -60] }))
      et.fire('create_portal_pair', { phase: wave * 0.7 })
    })
    add(4000, () => pickup(wave % 2 ? { shield: 50, text: '+ SHIELD' } : { energy: 45, text: '+ REPAIR' }))
    add(4000, () => {
      enemy(riftEnemy(0.2))
      enemy(riftEnemy(0.8))
      if (wave >= 5) enemy(beetle(0.5, true))
    })
    add(8000, () => {
      enemy(beetle(0.5, true))
      wasps(2)
      if (wave >= 6) enemy(riftEnemy(0.5, true))
      if (wave % 2 === 0) pickup({ energy: 30, text: '+ FIELD REPAIR' }, 0.65)
    })
  }
  add(8000, () => {
    enemy(Boss({ name: 'RIFT MATRIARCH', maxEnergy: 4200, attackSpeed: 1.2, rift: true }))
    et.fire('boss_arrival', 'RIFT MATRIARCH')
    et.fire('create_portal_pair', { duration: 90000 })
    pickup({ energy: 50, shield: 60, text: '+ BOSS SUPPLIES' })
  })
}
