module.exports.calculateTrajectory = (source, target, speed) => {
  const heading = Math.atan2(target[1] - source[1], target[0] - source[0])
  return [speed * Math.cos(heading), speed * Math.sin(heading)]
}

module.exports.calculateHeading = (source, target, speed) => {
  return Math.atan2(target[1] - source[1], target[0] - source[0])
}
