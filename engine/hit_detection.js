const maths = require('./maths')

module.exports.detect = (layer1, layer2) => {
  layer1.all().forEach(l1sprite => {
    const extent1 = l1sprite.getExtent()
    layer2.all().forEach(l2sprite => {
      const extent2 = l2sprite.getExtent()
      if (maths.overlap(extent1, extent2)) {
        l1sprite.hit(l2sprite)
        l2sprite.hit(l1sprite)
      }
    })
  })
}

