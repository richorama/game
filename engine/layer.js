module.exports = config => {
  let sprites = []

  return {
    all: () => sprites,
    clear: () => {
      sprites.forEach(sprite => { sprite.destroyed = true })
      sprites = []
    },
    addSprite: sprite => {
      sprite.removeFromLayer = () => {
        sprites = sprites.filter(x => x !== sprite)
        sprite.destroyed = true
      }
      sprites.push(sprite)
    },
    removeSprite: sprite => sprites = sprites.filter(x => x !== sprite),
    render: ctx => {
      if (config.preRender) config.preRender(ctx)
      sprites.forEach(sprite => sprite.render(ctx))
      if (config.postRender) config.postRender(ctx)
    },
    fire: (ctx, layer) => {
      sprites.forEach(sprite => {
        (sprite.fire(ctx) || []).forEach(newSprite => layer.addSprite(newSprite))
      })
    }

  }
}