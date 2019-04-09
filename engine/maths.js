module.exports.calculateTrajectory = (source, target, speed) => {
  const heading = Math.atan2(target[1] - source[1], target[0] - source[0])
  return [speed * Math.cos(heading), speed * Math.sin(heading)]
}
