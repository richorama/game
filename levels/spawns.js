const et = require('eventthing')
const Beetle = require('../sprites/beetle_enemy')
const Wasp = require('../sprites/wasp_enemy')

const enemy = sprite => et.fire('create_enemy', sprite)
const pickup = (upgrade, lane = 0.5) => et.fire('create_upgrade', {
  position: [window.innerWidth * lane, -20], speed: 130, radius: 16,
  colour: upgrade.weapon || upgrade.shield ? '#65e8ff' : '#aaff79', upgrade
})
const beetle = (lane, armoured = false) => Beetle({
  position: [window.innerWidth * lane, -50], speed: armoured ? 35 : 55,
  radius: armoured ? 34 : 24, colour: armoured ? '#d994ff' : '#ff9266',
  energy: armoured ? 180 : 40, rate: armoured ? 2300 : 2700, projectileSpeed: 220, armoured
})
const wasps = count => {
  for (let i = 0; i < count; i++) enemy(Wasp({
    position: [window.innerWidth * (i + 1) / (count + 1), -80 - i * 65], phase: i
  }))
}
module.exports = { enemy, pickup, beetle, wasps }
