import config from "../Config"
import { Player } from "common/src/Player"
import { Tile } from "common/src/Tile"

const decorations = Object.entries(config.entities)
  .filter(([_, val]) => typeof val === 'object')
  .map(([key, _]) => key)

const buildings = [
  { id: 'v:mine', health: 2 },
  { id: 'v:barracks', health: 2 },
  { id: 'v:tower', health: 2 },
  { id: 'v:woodwall', health: 4 },
  { id: 'v:stonewall', health: 7 }
]

function getRandomInt(max: number) {
  max = Math.floor(max)
  return Math.floor(Math.random() * max) // The maximum is exclusive and the minimum is inclusive
}

function randomlyExpand(posx: number, posy: number, map: Tile[], size: number, player: Player) {
  if (posx < 0 || posy < 0 || posx >= size || posy >= size) return
  const newTile = map[posy*size + posx]
  if (newTile.entity !== undefined) return

  map[posy*size + posx].owner = { name: player.name, isPlayer: true }

  if (Math.random() > 0.97) {
    newTile.resource = { id: 'v:gold' }
    if (Math.random() > 0.8) {
      newTile.entity = { id: 'v:mine', health: 2 }
    }
  }
  if (Math.random() > 0.96) {
    newTile.entity = { ...buildings[getRandomInt(buildings.length)] }
    if (Math.random() > 0.8){
      newTile.entity.health = (newTile.entity?.health ?? 2) - 1
    }
  }
  
  if (Math.random() > 0.71) randomlyExpand(posx+1, posy, map, size, player)
  if (Math.random() > 0.71) randomlyExpand(posx-1, posy, map, size, player)
  if (Math.random() > 0.71) randomlyExpand(posx, posy+1, map, size, player)
  if (Math.random() > 0.71) randomlyExpand(posx, posy-1, map, size, player)
}

export function generateMockMap(size: number, players?: Player[]): Tile[] {
  const map: Tile[] = []

  for (let i = 0; i < size; i++){
    for (let j = 0; j < size; j++){
      let newTile: Tile = { x: j, y: i }
      
      if (Math.random() > 0.88)
        newTile.entity = { id: decorations[getRandomInt(decorations.length)] }

      if (Math.random() > 0.97)
        newTile.resource = { id: 'v:gold' }

      map.push(newTile)
    }
  }

  for (let player of players || []) {
    if (player.team === 'spectator') continue
    if (player.eliminated) continue
    let posx = getRandomInt(size)
    let posy = getRandomInt(size)
    while (map[posy*size + posx].entity !== undefined) [posx, posy] = [getRandomInt(size), getRandomInt(size)]

    map[posy*size + posx].entity = { id: 'v:capitol', health: 3 }
    map[posy*size + posx].owner = { name: player.name, isPlayer: true }

    randomlyExpand(posx+1, posy, map, size, player)
    randomlyExpand(posx-1, posy, map, size, player)
    randomlyExpand(posx, posy+1, map, size, player)
    randomlyExpand(posx, posy-1, map, size, player)
  }

  return map
}
