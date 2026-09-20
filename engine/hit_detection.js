module.exports.detect = (layer1, layer2) => {
  layer1.all().forEach(l1sprite => {
    if (l1sprite.destroyed) return
    const extent1 = l1sprite.getExtent()
    layer2.all().forEach(l2sprite => {
      if (l1sprite.destroyed || l2sprite.destroyed) return
      if (l1sprite.canHit && !l1sprite.canHit(l2sprite)) return
      if (l2sprite.canHit && !l2sprite.canHit(l1sprite)) return
      const extent2 = l2sprite.getExtent()
      if (overlap(extent1, extent2)) {
        l1sprite.hit(l2sprite)
        l2sprite.hit(l1sprite)
      }
    })
  })
}

function overlap(e1, e2) {
  if (e1.endX !== undefined || e2.endX !== undefined) {
    const beam = e1.endX !== undefined ? e1 : e2
    const target = beam === e1 ? e2 : e1
    const dx = beam.endX - beam.x
    const dy = beam.endY - beam.y
    const lengthSquared = dx * dx + dy * dy
    const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1,
      ((target.x - beam.x) * dx + (target.y - beam.y) * dy) / lengthSquared))
    return Math.pow(beam.radius + target.radius, 2) >=
      Math.pow(target.x - beam.x - t * dx, 2) +
      Math.pow(target.y - beam.y - t * dy, 2)
  }

  return (
    Math.pow(e1.radius + e2.radius, 2) >=
    Math.pow(e2.x - e1.x, 2) + Math.pow(e2.y - e1.y, 2)
  )
}

module.exports.overlap = overlap
