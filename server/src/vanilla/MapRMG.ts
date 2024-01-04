import { Player } from "common/src/Player"
import config from "../Config"
import { Capitol } from "./Building"
import { ServerTile } from "../ConfigSpec"
import { getRandomInt } from "../util"

const goldRatio: number = 0.03
const decorationRatio: number = 0.18

const maxDistanceToStartingGold: number = 3

export default function generateMapRMG(size: number, players: Player[]): ServerTile[][] {
  const map: ServerTile[][] = []

  for (let i = 0; i < size; i++) {
    const row: ServerTile[] = []
    for (let j = 0; j < size; j++) {
      row.push(new ServerTile(j, i))
    }
    map.push(row)
  }

  generateGold(map, size)
  generateDecorations(map, size)
  generateCapitols(map, size, players)

  return map
}

const isOutOfBounds = (x: number, y: number, size: number) => x < 0 || x >= size || y < 0 || y >= size

const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]]

function generateGold(map: ServerTile[][], size: number): void {
  if (goldRatio === 0) return

  let goldPlaced = 0
  const goldQuadrantSize = goldRatio ** -0.5
  const numGoldQuadrants = size / goldQuadrantSize + 1

  const initialOffsetX = -Math.random() * goldQuadrantSize
  const initialOffsetY = -Math.random() * goldQuadrantSize
  for (let i = 0; i < numGoldQuadrants; i++) {
    for (let j = 0; j < numGoldQuadrants; j++) {
      const offsetX = Math.random() * goldQuadrantSize
      const offsetY = Math.random() * goldQuadrantSize

      const x = Math.floor(i * goldQuadrantSize + offsetX + initialOffsetX)
      const y = Math.floor(j * goldQuadrantSize + offsetY + initialOffsetY)

      if (isOutOfBounds(x, y, size)) continue

      const tile = map[y][x]
      if (tile.resource != null) continue
      tile.resource = { id: 'v:gold' }
      goldPlaced++
    }
  }
  console.log('[game][mapgen] gold generated', goldPlaced)
}

function generateDecorations(map: ServerTile[][], size: number): void {
  const isObstructed = (x: number, y: number) => isOutOfBounds(x, y, size) || map[y][x].entity != null

  const canPlaceDecorationAt = (x: number, y: number) => {
    const l = isObstructed(x - 1, y)
    const u = isObstructed(x, y - 1)
    const r = isObstructed(x + 1, y)
    const d = isObstructed(x, y + 1)
    const ul = isObstructed(x - 1, y - 1)
    const ur = isObstructed(x + 1, y - 1)
    const dl = isObstructed(x - 1, y + 1)
    const dr = isObstructed(x + 1, y + 1)
    const ll = isObstructed(x - 2, y)
    const uu = isObstructed(x, y - 2)
    const rr = isObstructed(x + 2, y)
    const dd = isObstructed(x, y + 2)

    // diagonal traversal
    if ((!dl && !ur) && (l || ll || ul || u || uu) && (r || rr || dr || d || dd) && (!(l || u) || !(d || r))) return false
    if ((!ul && !dr) && (l || ll || dl || d || dd) && (u || uu || ur || r || rr) && (!(l || d) || !(u || r))) return false

    // side traversal
    if ((!dl && !ul) && !l && ll && (d || dd || dr || r || rr || ur || u || uu)) return false
    if ((!ul && !ur) && !u && uu && (l || ll || dl || d || dd || dr || r || rr)) return false
    if ((!ur && !dr) && !r && rr && (u || uu || ul || l || ll || dl || d || dd)) return false
    if ((!dr && !dl) && !d && dd && (r || rr || ur || u || uu || ul || l || ll)) return false

    // dead ends - prevents unreachable single tiles
    if (!l && dl && ul && ll) return false
    if (!u && ul && ur && uu) return false
    if (!r && ur && dr && rr) return false
    if (!d && dr && dl && dd) return false

    return true
  }

  const decorations = Object.keys(config.entities).filter((entityKey) => config.entities[entityKey] == null)

  let decorationsPlaced = 0
  let decorationPatchesPlaced = 0

  const numDecorationPatchAttempts = Math.floor(size * size * decorationRatio)
  for (let i = 0; i < numDecorationPatchAttempts; i++) {
    let x = getRandomInt(size)
    let y = getRandomInt(size)

    let isPatchPlaced = false

    const numDecorationsPerPatch = getRandomInt(4)
    for (let j = 0; j < numDecorationsPerPatch; j++) {
      if (isOutOfBounds(x, y, size)) break
      const tile = map[y][x]

      if (tile.entity == null) {
        if (tile.resource != null) break // don't place on gold
        if (!canPlaceDecorationAt(x, y)) break

        tile.entity = { id: decorations[getRandomInt(decorations.length)], turnBuilt: 0 }
        decorationsPlaced++
        isPatchPlaced = true
      }

      const randomDirection = directions[getRandomInt(directions.length)]
      x += randomDirection[0]
      y += randomDirection[1]
    }
    if (isPatchPlaced) decorationPatchesPlaced++
  }
  console.log('[game][mapgen] decorations total', decorationsPlaced)
  console.log('[game][mapgen] decoration patches', decorationPatchesPlaced, '/', numDecorationPatchAttempts)
}

function generateCapitols(map: ServerTile[][], size: number, players: Player[]): void {
  const nonSpectators = players.filter(p => p.team !== 'spectator')

  const points = nonSpectators.map(_ => [Math.random() * size, Math.random() * size])
  // const points = Array(6).fill(null).map(_ => [Math.random() * size, Math.random() * size])

  // space out points
  const numIterations = (points.length <= 2) ? 2 : 6 // how many times to iterate
  const mapEdgeWeight = 0.5 // how much do map edges affect capitols compared to other capitols
  const numPushNearest = 3 // how many nearby points to push against
  const shiftMultiplier = 0.5 // how far to move capitols each iteration

  for (let iteration = 0; iteration < numIterations; iteration++) {
    if (points.length === 1) break

    const adjustments: number[][] = []

    for (let pointIndex = 0; pointIndex < points.length; pointIndex++) {
      const [currentX, currentY] = points[pointIndex]

      // calculate distances
      const otherPoints: number[][] = []
      for (let i = 0; i < points.length; i++) {
        if (pointIndex === i) continue
        const [otherX, otherY] = points[i]
        const [dx, dy] = [currentX - otherX, currentY - otherY]
        otherPoints.push([otherX, otherY, Math.sqrt(dx ** 2 + dy ** 2)])
      }

      // account for edge of the map
      if (mapEdgeWeight > 0) {
        const distanceCloseX = currentX
        const distanceFarX = size - 1 - currentX
        if (currentX < distanceFarX) otherPoints.push([currentX - distanceCloseX / mapEdgeWeight, currentY, distanceCloseX / mapEdgeWeight]) // left
        else otherPoints.push([currentX + distanceFarX / mapEdgeWeight, currentY, distanceFarX / mapEdgeWeight]) // right

        const distanceCloseY = currentY
        const distanceFarY = size - 1 - currentY
        if (currentY < distanceFarY) otherPoints.push([currentX, currentY - distanceCloseY / mapEdgeWeight, distanceCloseY / mapEdgeWeight]) // up
        else otherPoints.push([currentX, currentY + distanceFarY / mapEdgeWeight, distanceFarY / mapEdgeWeight]) // down
      }

      otherPoints.sort((left, right) => left[2] - right[2])

      // calculate necessary adjustment
      const numPushActual = Math.min(numPushNearest, otherPoints.length - 1)
      adjustments[pointIndex] = [0, 0]
      if (numPushActual < 1) continue // shouldn't happen but just in case
      let desiredDistance = otherPoints[numPushActual][2]

      let dx = 0, dy = 0
      for (let i = 0; i < numPushActual; i++) {
        const otherPoint = otherPoints[i]

        if (otherPoint[2] == 0) continue // distance is zero
        const distanceDifference = desiredDistance - otherPoint[2]

        const normalizedX = (currentX - otherPoint[0]) / otherPoint[2]
        const normalizedY = (currentY - otherPoint[1]) / otherPoint[2]

        const ddx = shiftMultiplier * distanceDifference * normalizedX / numPushActual
        const ddy = shiftMultiplier * distanceDifference * normalizedY / numPushActual

        dx += ddx
        dy += ddy
      }
      adjustments[pointIndex] = [dx, dy]
    }

    for (let i = 0; i < points.length; i++) {
      const [x, y] = points[i]
      const [dx, dy] = adjustments[i]

      const [newX, newY] = [x + dx, y + dy]

      if (isOutOfBounds(newX, newY, size)) continue

      points[i] = [newX, newY]
    }
  }

  // place capitols and gold
  for (let i = 0; i < points.length; i++) {
    const player = i < nonSpectators.length ? nonSpectators[i] : null

    const capitolTile = map[Math.floor(points[i][1])][Math.floor(points[i][0])]
    capitolTile.entity = new Capitol(0)
    if (player != null) capitolTile.owner = { name: player.name, isPlayer: true, team: player.team }
    // console.log('[game][mapgen] capitol', capitolTile.x + 1, capitolTile.y + 1)

    // ensure capitol is not obstructed
    const clearTile = (tile: ServerTile) => { tile.entity = tile.entity?.id === 'v:capitol' ? tile.entity : undefined }

    const corners = [[-1, -1], [-1, 1], [1, -1], [1, 1]]

    const cornerTiles = corners
      .map(dir => [capitolTile.x + dir[0], capitolTile.y + dir[1]])
      .filter(xy => !isOutOfBounds(xy[0], xy[1], size))
      .map(xy => map[xy[1]][xy[0]])

    const reachableCorners = cornerTiles
      .filter(tile => tile.entity == null || tile.entity.id === 'v:capitol')
      .filter(tile => (
        map[capitolTile.y][tile.x].entity == null || map[capitolTile.y][tile.x].entity?.id === 'v:capitol'
        || map[tile.y][capitolTile.x].entity == null || map[tile.y][capitolTile.x].entity?.id === 'v:capitol'
      ))

    if (reachableCorners.length === 0) {
      const randomCorner = cornerTiles[getRandomInt(cornerTiles.length)]
      console.log('[game][mapgen]  capitol is obstructed; cleared corner', randomCorner.x + 1, randomCorner.y + 1)
      clearTile(randomCorner)
      clearTile(map[capitolTile.y][randomCorner.x])
      clearTile(map[randomCorner.y][capitolTile.x])
    }

    // add gold nearby
    let goldTile = capitolTile

    let previousDirection: number[] | null = null
    let step = 0

    const numSteps = getRandomInt(maxDistanceToStartingGold) + 1
    while (step < numSteps || (goldTile.x === capitolTile.x && goldTile.y === capitolTile.y)) {
      const possibleSteps = directions
        .filter(dir => previousDirection == null || !(previousDirection[0] === dir[0] || previousDirection[1] === dir[1]))
        .map(dir => [goldTile.x + dir[0], goldTile.y + dir[1]])
        .filter(xy => !isOutOfBounds(xy[0], xy[1], size))
        .map(xy => map[xy[1]][xy[0]])
        .filter(tile => tile.entity == null)

      if (possibleSteps.length === 0) break
      const nextTile = possibleSteps[getRandomInt(possibleSteps.length)]

      previousDirection = [nextTile.x - goldTile.x, nextTile.y - goldTile.y]
      goldTile = nextTile
      step++
    }

    goldTile.resource = { id: 'v:gold' }
    // console.log('[game][mapgen]  gold', step, 'steps', goldTile.x + 1, goldTile.y + 1)
  }
}
