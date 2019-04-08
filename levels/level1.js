const et = require('eventthing')
const Level1Enemy = require('../sprites/level1_enemy')

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
}
