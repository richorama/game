const et = require('eventthing')
const Level1Enemy = require('../sprites/level1_enemy')
const SimpleGun = require('../sprites/simple_gun')

const create = (name, value) => et.fire(name, value)

const createBasicEnemy = position => {
  create(
    'create_enemy',
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

const createUpgrade = upgrade => {
  create('create_upgrade', {
    position: [0, window.innerHeight / 2],
    speed: 20,
    radius: 10,
    colour: 'rgb(152, 195, 121)',
    upgrade
  })
}

module.exports = add => {
  add(100, () => {
    createBasicEnemy([0, 0])
    createBasicEnemy([window.innerWidth, 0])
  })

  // speedup
  add(100, () => createUpgrade({ speedup: 100 }))

  // enemies behind
  add(5000, () => {
    createBasicEnemy([0, window.innerHeight])
    createBasicEnemy([window.innerWidth, window.innerHeight])
  })

  // rear facing gun
  add(100, () =>
    createUpgrade({
      weapon: SimpleGun({
        rate: 200,
        velocity: [0, 300],
        offset: [0, 12.5],
        damage: 5
      })
    })
  )

  // 4 more enemies
  add(8000, () => {
    createBasicEnemy([0, 0])
    createBasicEnemy([window.innerWidth, 0])
    createBasicEnemy([0, window.innerHeight])
    createBasicEnemy([window.innerWidth, window.innerHeight])
  })

}
