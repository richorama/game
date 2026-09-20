const et = require('eventthing')

module.exports = () => {
  let score = 0
  let wave = { number: 1, total: 9 }
  let complete = false
  let announcement = ''
  let announcementAge = 2000
  const announce = text => { announcement = text; announcementAge = 0 }
  const weapons = ['Blaster']
  et.on('enemy_destroyed', points => { score += points })
  et.on('wave', value => { wave = value; announce('WAVE ' + value.number + ' / ' + value.total) })
  et.on('boss_arrival', () => announce('WARNING: HIVE QUEEN'))
  et.on('boss_phase', phase => announce('QUEEN ENRAGED - PHASE ' + phase))
  et.on('level_complete', () => { complete = true })
  et.on('upgrade', upgrade => {
    if (upgrade.weapon && upgrade.name) weapons.push(upgrade.name)
  })

  return {
    reset: () => {
      score = 0
      wave = { number: 1, total: 9 }
      complete = false
      announcement = ''
      announcementAge = 2000
      weapons.splice(0, weapons.length, 'Blaster')
    },
    render: ctx => {
      const { buffer, ship, enemies } = ctx
      const width = window.innerWidth
      const height = window.innerHeight
      buffer.save()
      buffer.font = '14px Orbitron, monospace'
      buffer.fillStyle = '#c7eaff'
      buffer.fillText('SCORE ' + score.toString().padStart(5, '0'), 20, 65)
      buffer.textAlign = 'right'
      buffer.fillText('WAVE ' + wave.number + ' / ' + wave.total, width - 20, 65)
      buffer.textAlign = 'center'
      buffer.fillStyle = '#65e8ff'
      buffer.fillText('SHIELD ' + ship.getShield(), width / 2, 65)
      buffer.fillStyle = 'rgba(8, 15, 32, 0.85)'
      buffer.fillRect(0, height - 62, width, 62)
      buffer.textAlign = 'center'
      buffer.font = '12px Orbitron, monospace'
      buffer.fillStyle = '#65e8ff'
      buffer.fillText(weapons.join('  /  '), width / 2, height - 37, width - 24)
      buffer.fillStyle = '#a4b6cf'
      buffer.fillText('ARROWS: MOVE   |   SPACE: FIRE   |   R: RESTART   |   M: SOUND   |   COLLECT UPGRADES',
        width / 2, height - 15, width - 24)
      const cannon = ctx.weapons.all().find(weapon => weapon.getHeat)
      if (cannon) {
        buffer.textAlign = 'left'
        buffer.fillStyle = cannon.isOverheated() ? '#ff805f' : '#d994ff'
        buffer.fillText(cannon.isOverheated() ? 'BEAM COOLING' : 'BEAM HEAT', 20, height - 90)
        buffer.fillStyle = '#382439'
        buffer.fillRect(20, height - 82, 130, 5)
        buffer.fillStyle = cannon.isOverheated() ? '#ff805f' : '#d994ff'
        buffer.fillRect(20, height - 82, cannon.getHeat() * 1.3, 5)
        buffer.textAlign = 'center'
      }

      const boss = enemies.all().find(enemy => enemy.isBoss)
      if (boss) {
        const barWidth = Math.min(420, width - 40)
        buffer.fillStyle = '#ff9dd8'
        buffer.fillText('HIVE QUEEN / PHASE ' + boss.getPhase(), width / 2, 88)
        buffer.fillStyle = '#382439'
        buffer.fillRect((width - barWidth) / 2, 98, barWidth, 10)
        buffer.fillStyle = '#ff9dd8'
        buffer.shadowColor = '#ff9dd8'
        buffer.shadowBlur = 10
        buffer.fillRect((width - barWidth) / 2, 98, barWidth * boss.getHealth() / boss.getMaxHealth(), 10)
        buffer.shadowBlur = 0
      }
      announcementAge += ctx.timeSinceLastFrame
      if (announcementAge < 1800 && !ship.isDestroyed()) {
        buffer.save()
        buffer.globalAlpha = Math.min(1, (1800 - announcementAge) / 400)
        buffer.fillStyle = boss ? '#ff9dd8' : '#65e8ff'
        buffer.shadowColor = buffer.fillStyle
        buffer.shadowBlur = 18
        buffer.font = '24px Orbitron, monospace'
        buffer.fillText(announcement, width / 2, height * 0.32, width - 40)
        buffer.restore()
      }
      if (ship.isDestroyed() || (complete && enemies.all().length === 0)) {
        buffer.fillStyle = 'rgba(8, 15, 32, 0.8)'
        buffer.fillRect(0, 0, width, height)
        buffer.fillStyle = ship.isDestroyed() ? '#ff9266' : '#65e8ff'
        buffer.font = '32px Orbitron, monospace'
        buffer.fillText(ship.isDestroyed() ? 'SHIP DESTROYED' : 'SECTOR CLEARED',
          width / 2, height / 2 - 25, width - 30)
        buffer.font = '16px Orbitron, monospace'
        buffer.fillStyle = '#ffffff'
        buffer.fillText('SCORE ' + score + '  |  PRESS R TO RESTART', width / 2, height / 2 + 20, width - 30)
      }
      buffer.restore()
    }
  }
}
