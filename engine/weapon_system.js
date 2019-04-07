const et = require('eventthing')
const keyboard = require('./keyboard')
let weapons = []

let keys = {}
const getKeyboardState = () => {
  keys = keyboard.keyStates()
}
et.on('keydown', getKeyboardState)
et.on('keyup', getKeyboardState)

module.exports.fire = (ctx, layer) => {
  if (!keys.ControlLeft) return
  weapons.forEach(weapon => {
    (weapon.fire(ctx) || []).forEach(newSprite => layer.addSprite(newSprite)) 
  })
}

module.exports.add = newWeapon => weapons.push(newWeapon)

et.on('weaponadded', weapon => weapons.push(weapon))