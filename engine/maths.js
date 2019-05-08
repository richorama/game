module.exports.calculateTrajectory = (source, target, speed) => {
  const heading = Math.atan2(target[1] - source[1], target[0] - source[0])
  return [speed * Math.cos(heading), speed * Math.sin(heading)]
}

module.exports.calculateHeading = (source, target, speed) => {
  return Math.atan2(target[1] - source[1], target[0] - source[0])
}

const getDistanceSqrd = (source, target) => {
  return Math.pow(target[0] - source[0], 2) + Math.pow(target[1] - source[1], 2) 
}

module.exports.getNearest = (source, targets) => {
  if (targets.length === 0) return
  let nearest = targets[0]
  let distanceSqrd = getDistanceSqrd(source, nearest) 
  for (var i = 1; i < targets.length; i++){
    let nextDist = getDistanceSqrd(source, targets[i])
    if (nextDist < distanceSqrd){
      distanceSqrd = nextDist
      nearest = targets[i]
    }
  }
  return nearest
}