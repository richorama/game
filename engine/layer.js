module.exports = config => {
  let sprites = []

  return {
    addSprite: sprite => {
      sprite.removeFromLayer = () => sprites = sprites.filter(x => x !== sprite)
      sprites.push(sprite)
    },
    removeSprite: sprite => sprites = sprites.filter(x => x !== sprite),
    render: ctx => {
      sprites.forEach(sprite => sprite.render(ctx))
    }
  }
}