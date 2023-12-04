import gameConfig from '../Config'
import { Tile } from './Tile'
import { ConfigStaticEntity, EntityTile, ResourceTile } from '../ConfigSpec'
import StaticEntity from './StaticEntity'

function getResourceElement(resourceSpec: ResourceTile | ConfigStaticEntity | null, selected: boolean, tile: Tile) {
  if (resourceSpec === null) return null
  if (typeof resourceSpec === 'object') return <StaticEntity img={resourceSpec?.img} />
  if (typeof resourceSpec === 'function') return resourceSpec?.(selected, tile.resource?.state)
  return null
}

function getEntityElement(entitySpec: EntityTile | ConfigStaticEntity | null, selected: boolean, tile: Tile) {
  if (entitySpec === null) return null
  if (typeof entitySpec === 'object') return <StaticEntity img={entitySpec?.img} />
  if (typeof entitySpec === 'function') return entitySpec(selected, tile.entity?.health, tile.entity?.state, tile.resource)
  return null
}

export default function MapTile ({ tile, select, selected = false }: { tile: Tile, select: (newx: number, newy: number)=>any, selected?: boolean }): JSX.Element {
  const resourceSpec: ResourceTile | ConfigStaticEntity | null = tile?.resource?.id !== undefined ? gameConfig.resources?.[tile?.resource?.id] : null
  const resource = getResourceElement(resourceSpec, selected, tile)

  const entitySpec: EntityTile | ConfigStaticEntity | null = tile.entity?.id !== undefined ? gameConfig.entities[tile.entity.id] : null
  const entity = getEntityElement(entitySpec, selected, tile)

  return (
    <div
      className='tile text-[0.4rem] bg-gray-500'
      onClick={() => select(tile.x, tile.y)}
    >
      {resource}
      {entity}
      {selected && <div className="tile-selected"></div>}
    </div>
  )
}