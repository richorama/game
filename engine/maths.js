module.exports.calculateTrajectory = (source, target, speed) => {
  const heading = Math.atan2(target[1] - source[1], target[0] - source[0])
  return [speed * Math.cos(heading), speed * Math.sin(heading)]
}

module.exports.calculateHeading = (source, target) => {
  return Math.atan2(target[1] - source[1], target[0] - source[0])
}

// do these two extents overlap?
module.exports.overlap = (e1, e2) => {
  return (
    Math.pow(e1.radius + e2.radius, 2) >=
    Math.pow(e2.x - e1.x, 2) + Math.pow(e2.y - e1.y, 2)
  )
}

module.exports.distance = (e1, e2) => {
  return Math.sqrt(Math.pow(e2.x - e1.x, 2) + Math.pow(e2.y - e1.y, 2))
}