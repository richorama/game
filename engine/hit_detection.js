module.exports.detect = (layer1, layer2) => {
  layer1.all().forEach(l1sprite => {
    const extent1 = l1sprite.getExtent()
    layer2.all().forEach(l2sprite => {
      const extent2 = l2sprite.getExtent()
      if (overlap(extent1, extent2)) {
        l1sprite.hit(l2sprite)
        l2sprite.hit(l1sprite)
      }
    })
  })
}

function overlap(e1, e2) {
  return (
    Math.pow(e1.radius + e2.radius, 2) >=
    Math.pow(e2.x - e1.x, 2) + Math.pow(e2.y - e1.y, 2)
  )
}
