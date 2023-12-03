import { ReactNode } from 'react'
import gameConfig from '../game/Config'
import { Entity, Resource, Tile } from './Tile'

export type ResourceTile = (
  selected: boolean,
  resourceState?: Resource['state']
) => ReactNode

export type EntityTile = (
  selected: boolean,
  health?: number,
  state?: Entity['state'],
  resource?: Resource
) => ReactNode

export default function MapTile ({ tile, select, selected = false }: { tile: Tile, select: (newx: number, newy: number)=>any, selected?: boolean }): JSX.Element {
  const resource: ResourceTile = (tile.resource !== undefined && tile.resource.id in gameConfig.resources) ? gameConfig.resources[tile.resource.id] : () => null
  const entity: EntityTile = (tile.entity !== undefined && tile.entity.id in gameConfig.entities) ? gameConfig.entities[tile.entity.id] : () => null

  return (
    <div
      className='tile text-[0.4rem] bg-gray-500'
      onClick={() => select(tile.x, tile.y)}
    >
      {resource(selected, tile.resource?.state)}
      {entity(selected, tile.entity?.health, tile.entity?.state, tile.resource)}
      {selected && <div className="tile-selected"></div>}
    </div>
  )
}