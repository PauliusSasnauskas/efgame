import { ReactNode, useState } from "react"
import { Tile } from "common/src/Tile"
import MapTile from "./MapTile"


function range (n: number): number[] {
  return Array.from(Array(n).keys())
}

function MapError ({ children }: { children?: ReactNode }): JSX.Element {
  return <div className='w-full h-full flexc text-red-500'>{children}</div>
}

function checkTileBorders(tiles: Tile[][], row: number, col: number, size: number): string | undefined {
  const tileOwner = tiles[row][col].owner?.name
  if (tileOwner === undefined) return undefined
  const borderTop = row === 0 || tiles[(row-1)][col].owner?.name !== tileOwner ? '1' : '0'
  const borderRight = col === size-1 || tiles[row][col + 1].owner?.name !== tileOwner ? '1' : '0'
  const borderBottom = row === size-1 || tiles[(row+1)][col].owner?.name !== tileOwner ? '1' : '0'
  const borderLeft = col === 0 || tiles[row][col - 1].owner?.name !== tileOwner ? '1' : '0'
  return borderTop + borderRight + borderBottom + borderLeft
}

export function Map ({ tiles = [], select, selected }: { tiles?: Tile[][], select: (newx: number, newy: number)=>any, selected: [number, number] }): JSX.Element {
  const size = tiles.length
  const initialOffset = [Math.floor(size / 2) - 10, Math.floor(size / 2) - 10]
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [offset, setOffset] = useState<[number, number]>([0, 0])

  if (size === 0) {
    return <MapError>Error retrieving tile data.</MapError>
  }

  if (size > 20) {
    return <MapError>Map size {'>'} 20 not yet implemented</MapError>
  }


  return (
    <div className='m-map'>
      {range(20*20).map((index) => {
        const [rowOffsetI, colOffsetI] = initialOffset
        const [rowOffset, colOffset] = offset

        const row = rowOffsetI + rowOffset + Math.floor(index / 20)
        const col = colOffsetI + colOffset + index % 20

        if (row < 0 || row >= size || col < 0 || col >= size) return <div key={index} />
        const tile = tiles[row][col]
        const borders = checkTileBorders(tiles, row, col, size)
        return <MapTile tile={tile} key={index} select={select} selected={col === selected[0] && row === selected[1]} borders={borders} />
      })}
    </div>
  )
}