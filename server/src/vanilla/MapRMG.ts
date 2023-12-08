import { Player } from "common/src/Player"
import { Tile } from "common/src/Tile"
import config from "../Config"

function getRandomInt(max: number) {
  max = Math.floor(max)
  return Math.floor(Math.random() * max) // The maximum is exclusive
}

const maxDistTo1stGold = 3

export default function generateMapRMG(size: number, players: Player[]): Tile[][] {
  const decorations = Object.entries(config.entities)
    .filter(([_, val]) => val === null)
    .map(([key, _]) => key)

  const map: Tile[][] = []

  for (let i = 0; i < size; i++){
    const newRow: Tile[] = []
    for (let j = 0; j < size; j++){
      let newTile: Tile = { x: j, y: i }
      
      if (Math.random() > 0.88)
        newTile.entity = { id: decorations[getRandomInt(decorations.length)] }

      if (Math.random() > 0.97)
        newTile.resource = { id: 'v:gold' }

      newRow.push(newTile)
    }
    map.push(newRow)
  }

  for (let player of players) {
    if (player.team === 'spectator') continue
    let posx = getRandomInt(size)
    let posy = getRandomInt(size)
    while (map[posy][posx].entity !== undefined) [posx, posy] = [getRandomInt(size), getRandomInt(size)]

    map[posy][posx].entity = { id: 'v:capitol', health: 3 }
    map[posy][posx].owner = { name: player.name, isPlayer: true, team: player.team }

    while (map[posy][posx].entity !== undefined) [posx, posy] = [getRandomInt(maxDistTo1stGold), getRandomInt(maxDistTo1stGold)]
    map[posy][posx].resource = { id: 'v:gold' }
  }

  return map
}