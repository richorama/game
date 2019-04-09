const et = require('eventthing')
const Level1Enemy = require('../sprites/level1_enemy')
const Upgrade = require('../sprites/upgrade')

const create = (name, value) => et.fire(name, value)

const createBasicEnemy = position => {
  create(
    'createenemy',
    Level1Enemy({
      position: position,
      speed: 30,
      radius: 20,
      colour: 'rgb(224, 108, 117)',
      energy: 30,
      rate: 2000
    })
  )
}

module.exports = add => {
  add(100, () => {
    createBasicEnemy([0, 0])
    createBasicEnemy([window.innerWidth, 0])
  })
  add(100, () => {
    create('createupgrade', {
      position: [0, window.innerHeight / 2],
      speed: 20,
      radius: 10,
      colour: 'rgb(152, 195, 121)',
      upgrade: {
        speedup: 100
      }
    })
  })
}
