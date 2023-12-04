import config from "../Config";
import { Tile } from "./Tile";

const decorations = Object.entries(config.entities)
  .filter(([_, val]) => typeof val === 'object')
  .map(([key, _]) => key)

const buildings = [
  { id: 'v:capitol', health: 3 },
  { id: 'v:mine', health: 2 },
  { id: 'v:barracks', health: 2 },
  { id: 'v:tower', health: 2 },
  { id: 'v:woodwall', health: 4 },
  { id: 'v:stonewall', health: 7 }
]

function getRandomInt(max: number) {
  max = Math.floor(max);
  return Math.floor(Math.random() * max); // The maximum is exclusive and the minimum is inclusive
}

export default function generateMockMap(size: number): Tile[] {
  const map: Tile[] = []

  for (let i = 0; i < size; i++){
    for (let j = 0; j < size; j++){
      let newTile: Tile = { x: j, y: i }
      
      if (Math.random() > 0.85)
        newTile.entity = { id: decorations[getRandomInt(decorations.length)] }
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

      map.push(newTile)
    }
  }

  return map
}