const et = require('eventthing')
const Beetle = require('../sprites/beetle_enemy')
const Spider = require('../sprites/spider_enemy')
const Wasp = require('../sprites/wasp_enemy')
const SimpleGun = require('../sprites/simple_gun')
const BlasterGun = require('../sprites/blaster_gun')
const MissileLauncher = require('../sprites/missile_launcher')
const Boss = require('../sprites/boss_enemy')
const RotaryGun = require('../sprites/rotary_gun')
const Drone = require('../sprites/drone_enemy')

const createEnemy = enemy => et.fire('create_enemy', enemy)
const createUpgrade = (upgrade, lane = 0.5) => et.fire('create_upgrade', {
  position: [window.innerWidth * lane, -20],
  speed: 130,
  radius: 16,
  colour: upgrade.weapon || upgrade.shield ? '#65e8ff' : '#aaff79',
  upgrade
})

const beetle = (lane, armoured = false) => Beetle({
  position: [window.innerWidth * lane, -50],
  speed: armoured ? 35 : 55,
  radius: armoured ? 34 : 24,
  colour: armoured ? '#d994ff' : '#ff9266',
  energy: armoured ? 180 : 40,
  rate: armoured ? 2300 : 2700,
  projectileSpeed: 220,
  armoured
})

const createWasps = count => {
  for (let i = 0; i < count; i++) {
    createEnemy(Wasp({
      position: [window.innerWidth * (i + 1) / (count + 1), -80 - i * 65],
      phase: i
    }))
  }
}

const weapons = [
  () => ({
    name: 'Spread shot',
    weapon: SimpleGun({
      rate: 350, velocity: [0, -620], damage: 8, colour: '#65e8ff', radius: 6,
      barrels: [-0.32, 0, 0.32].map(angle => ({ angle, offset: [0, -30] }))
    })
  }),
  () => ({
    name: 'Twin pulse',
    weapon: SimpleGun({
      rate: 140, velocity: [0, -720], damage: 6, colour: '#ffd36a', radius: 6,
      barrels: [-22, 22].map(x => ({ angle: 0, offset: [x, -15] }))
    })
  }),
  () => ({
    name: 'Beam cannon',
    weapon: BlasterGun({
      rate: 24, velocity: [0, -700], offset: [30, 0], damage: 2
    })
  }),
  () => ({
    name: 'Heat seeker',
    weapon: MissileLauncher({ rate: 450, offset: [0, -30], damage: 18 })
  }),
  () => ({
    name: 'Rear shot',
    weapon: SimpleGun({
      rate: 250, velocity: [0, 520], offset: [0, 30], damage: 12, colour: '#d994ff'
    })
  }),
  () => ({
    name: 'Flank cannons',
    weapon: SimpleGun({
      rate: 300, velocity: [0, -540], damage: 16, colour: '#ff9dd8', radius: 8,
      barrels: [-1, 1].map(side => ({
        angle: side * Math.PI / 2, offset: [side * 25, 0]
      }))
    })
  }),
  () => ({
    name: 'Heavy pulse',
    weapon: SimpleGun({
      rate: 550, velocity: [0, -460], offset: [0, -35], damage: 55,
      colour: '#aaff79', radius: 13
    })
  }),
  () => ({
    name: 'Rotary halo',
    weapon: RotaryGun()
  })
]

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
      if (wave <= weapons.length) {
        const upgrade = weapons[wave - 1]()
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
    et.fire('boss_arrival')
    createUpgrade({ energy: 50, shield: 50, text: '+ BOSS SUPPLIES' })
  })
}
