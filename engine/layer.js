module.exports = config => {
  let sprites = []

  return {
    addSprite: sprite => sprites.push(sprite),
    removeSprite: sprite => sprites = sprites.filter(x => x !== sprite),
    render: ctx => {
      sprites.forEach(sprite => sprite.render(ctx))
    }
  }
}