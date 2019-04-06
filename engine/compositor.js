module.exports.compose = (ctx, layers) => {
  layers.forEach(layer => layer.render(ctx))
}