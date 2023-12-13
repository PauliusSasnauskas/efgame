import { Player } from "common/src/Player"
import config from "../Config"
import { Capitol } from "./Building"
import { ServerTile } from "../ConfigSpec"
import { getRandomInt } from "../util"

const maxDistTo1stGold = 3

export default function generateMapRMG(size: number, players: Player[]): ServerTile[][] {
  const decorations = Object.entries(config.entities)
    .filter(([_, val]) => val === null)
    .map(([key, _]) => key)

  const map: ServerTile[][] = []

  for (let i = 0; i < size; i++){
    const newRow: ServerTile[] = []
    for (let j = 0; j < size; j++){
      let newTile: ServerTile = new ServerTile(j, i)
      
      if (Math.random() > 0.88)
        newTile.entity = { id: decorations[getRandomInt(decorations.length)], turnBuilt: 0 }

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

    // TODO: space out capitols if possible
    map[posy][posx].entity = new Capitol(0)
    map[posy][posx].owner = { name: player.name, isPlayer: true, team: player.team }

    while (map[posy][posx].entity !== undefined) [posx, posy] = [getRandomInt(maxDistTo1stGold), getRandomInt(maxDistTo1stGold)]
    map[posy][posx].resource = { id: 'v:gold' }
  }
  // TODO: make capitols reachable from one another

  return map
}