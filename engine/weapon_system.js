const et = require('eventthing')
let weapons = []

let keys = {}
et.on('keychange', newKeys => keys = newKeys)

module.exports.fire = (ctx, layer) => {
  if (!keys.ControlLeft) return
  weapons.forEach(weapon => {
    (weapon.fire(ctx) || []).forEach(newSprite => layer.addSprite(newSprite))
  })
}

module.exports.add = newWeapon => weapons.push(newWeapon)

et.on('weaponadded', weapon => weapons.push(weapon))