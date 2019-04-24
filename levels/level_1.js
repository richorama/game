const et = require('eventthing')
const Beetle = require('../sprites/beetle_enemy')
const Spider = require('../sprites/spider_enemy')
const SimpleGun = require('../sprites/simple_gun')
const BlasterGun = require('../sprites/blaster_gun')

const create = (name, value) => et.fire(name, value)

const createBasicEnemy = position => {
  create(
    'create_enemy',
    Beetle({
      position: position,
      speed: 30,
      radius: 20,
      colour: 'rgb(224, 108, 117)',
      energy: 30,
      rate: 2000
    })
  )
}

const createSpider = position => {
  create(
    'create_enemy',
    Spider({
      position: position,
      speed: 10,
      radius: 30,
      colour: '#61AFEF',
      energy: 70,
      rate: 1000
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

  add(100, () =>
    createUpgrade({
      text: '+ BEAM WEAPON',
      weapon: BlasterGun({
        rate: 1000,
        velocity: [0, -200],
        offset: [30, 0],
        damage: 30
      })
    })
  )

  add(100, () => {
    createSpider([0, 0])
    createSpider([window.innerWidth, 0])
  })

  // speedup
  add(1000, () => createUpgrade({ speedup: 100, text: '+ SPEED UP' }))

  // enemies behind
  add(5000, () => {
    createBasicEnemy([0, window.innerHeight])
    createBasicEnemy([window.innerWidth, window.innerHeight])
  })

  // rear facing gun
  add(100, () =>
    createUpgrade({
      text: '+ REAR SHOT',
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



  add(1000, () => {
    createUpgrade({
      text: '+ HEALTH',
      energy: 50
    })
  })
}
