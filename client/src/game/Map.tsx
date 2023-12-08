import { ReactNode, useState } from "react"
import { Tile } from "common/src/Tile"
import MapTile from "./MapTile"


function range (n: number): number[] {
  return Array.from(Array(n).keys())
}

function MapError ({ children }: { children?: ReactNode }): JSX.Element {
  return <div className='w-full h-full flexc text-red-500'>{children}</div>
}

export function Map ({ tiles = [], mapSize, select, selected }: { tiles?: Tile[], mapSize: number, select: (newx: number, newy: number)=>any, selected: [number, number] }): JSX.Element {
  const initialOffset = [Math.floor(mapSize / 2) - 10, Math.floor(mapSize / 2) - 10]
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [offset, setOffset] = useState<[number, number]>([0, 0])

  if (mapSize === 0 || tiles.length === 0) {
    return <MapError>Error retrieving tile data.</MapError>
  }

  if (mapSize > 20) {
    return <MapError>Map size {'>'} 20 not yet implemented</MapError>
  }

  function getTile(x: number, y: number): Tile | undefined {
    return tiles?.find((tile: Tile) => tile.x === x && tile.y === y)
  }

  function checkTileBorders(tiles: Tile[], tile: Tile | undefined, size: number): string | undefined {
    if (tile === undefined) return undefined
    const tileOwner = tile.owner?.name
    if (tileOwner === undefined) return undefined
    const x = tile.x
    const y = tile.y
    const borderTop = y === 0 || getTile(x, y-1)?.owner?.name !== tileOwner ? '1' : '0'
    const borderRight = x === size-1 || getTile(x + 1, y)?.owner?.name !== tileOwner ? '1' : '0'
    const borderBottom = y === size-1 || getTile(x, y+1)?.owner?.name !== tileOwner ? '1' : '0'
    const borderLeft = x === 0 || getTile(x - 1, y)?.owner?.name !== tileOwner ? '1' : '0'
    return borderTop + borderRight + borderBottom + borderLeft
  }

  return (
    <div className='m-map'>
      {range(20*20).map((index) => {
        const [rowOffsetI, colOffsetI] = initialOffset
        const [rowOffset, colOffset] = offset

        const row = rowOffsetI + rowOffset + Math.floor(index / 20)
        const col = colOffsetI + colOffset + index % 20

        if (row < 0 || row >= mapSize || col < 0 || col >= mapSize) return <div className='bg-black' key={index} />
        const tile = getTile(col, row)
        const borders = checkTileBorders(tiles, tile, mapSize)
        return <MapTile tile={tile} x={col} y={row} key={index} select={select} selected={col === selected[0] && row === selected[1]} borders={borders} />
      })}
    </div>
  )
}