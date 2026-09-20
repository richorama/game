module.exports = () => {
  const velocity = [0, 0]
  const force = [0, 0]
  const drag = 6

  return {
    accelerate: (ax, ay) => {
      force[0] += ax
      force[1] += ay
    },
    step: dt => {
      const seconds = dt / 1000
      const decay = Math.exp(-drag * seconds)
      const integral = (1 - decay) / drag
      // Integrate acceleration and drag together to keep the pull frame-rate independent.
      return velocity.map((speed, axis) => {
        const terminal = force[axis] / drag
        const distance = speed * integral + terminal * (seconds - integral)
        velocity[axis] = speed * decay + terminal * (1 - decay)
        force[axis] = 0
        return distance
      })
    },
    reset: () => {
      velocity.fill(0)
      force.fill(0)
    }
  }
}
