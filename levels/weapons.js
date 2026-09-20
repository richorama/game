const SimpleGun = require('../sprites/simple_gun')
const BlasterGun = require('../sprites/blaster_gun')
const MissileLauncher = require('../sprites/missile_launcher')
const RotaryGun = require('../sprites/rotary_gun')
const NovaGun = require('../sprites/nova_gun')

module.exports = {
  spread: () => ({
    name: 'Spread shot',
    weapon: SimpleGun({
      rate: 350, velocity: [0, -620], damage: 8, colour: '#65e8ff', radius: 6,
      barrels: [-0.32, 0, 0.32].map(angle => ({ angle, offset: [0, -30] }))
    })
  }),
  twin: () => ({
    name: 'Twin pulse',
    weapon: SimpleGun({
      rate: 140, velocity: [0, -720], damage: 6, colour: '#ffd36a', radius: 6,
      barrels: [-22, 22].map(x => ({ angle: 0, offset: [x, -15] }))
    })
  }),
  beam: () => ({
    name: 'Beam cannon',
    weapon: BlasterGun({ rate: 24, velocity: [0, -700], offset: [30, 0], damage: 2 })
  }),
  seeker: () => ({
    name: 'Heat seeker',
    weapon: MissileLauncher({ rate: 450, offset: [0, -30], damage: 18 })
  }),
  rear: () => ({
    name: 'Rear shot',
    weapon: SimpleGun({
      rate: 250, velocity: [0, 520], offset: [0, 30], damage: 12, colour: '#d994ff'
    })
  }),
  flank: () => ({
    name: 'Flank cannons',
    weapon: SimpleGun({
      rate: 300, velocity: [0, -540], damage: 16, colour: '#ff9dd8', radius: 8,
      barrels: [-1, 1].map(side => ({ angle: side * Math.PI / 2, offset: [side * 25, 0] }))
    })
  }),
  heavy: () => ({
    name: 'Heavy pulse',
    weapon: SimpleGun({
      rate: 550, velocity: [0, -460], offset: [0, -35], damage: 55, colour: '#aaff79', radius: 13
    })
  }),
  rotary: () => ({ name: 'Rotary halo', weapon: RotaryGun() }),
  rail: () => ({
    name: 'Rail lance',
    weapon: SimpleGun({
      rate: 600, velocity: [0, -900], offset: [0, -32], damage: 40,
      colour: '#d9ffff', radius: 5, pierce: 4, trailLength: 65
    })
  }),
  nova: () => ({ name: 'Nova pulse', weapon: NovaGun() })
}
