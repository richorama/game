const layers = []

module.exports.add = layer => {
  layers.push(layer)
  return layer
}

module.exports.all = () => layers