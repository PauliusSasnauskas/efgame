import { Player } from "common/src/Player"
import { Tile } from "common/src/Tile"
import config from "../Config"

function getRandomInt(max: number) {
  max = Math.floor(max)
  return Math.floor(Math.random() * max) // The maximum is exclusive
}

const maxDistTo1stGold = 3

export default function generateMapRMG(size: number, players: Player[]): Tile[] {
  const decorations = Object.entries(config.entities)
    .filter(([_, val]) => Object.keys(val).length === 0)
    .map(([key, _]) => key)

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

  for (let player of players) {
    if (player.team === 'spectator') continue
    let posx = getRandomInt(size)
    let posy = getRandomInt(size)
    while (map[posy*size + posx].entity !== undefined) [posx, posy] = [getRandomInt(size), getRandomInt(size)]

    map[posy*size + posx].entity = { id: 'v:capitol', health: 3 }
    map[posy*size + posx].owner = { name: player.name, isPlayer: true }

    while (map[posy*size + posx].entity !== undefined) [posx, posy] = [getRandomInt(maxDistTo1stGold), getRandomInt(maxDistTo1stGold)]
    map[posy*size + posx].resource = { id: 'v:gold' }
  }

  return map
}