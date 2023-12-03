import { ReactNode, useState } from "react";
import { Tile } from "../../model/Tile";
import clsx from "clsx";

function range (n: number): number[] {
  return Array.from(Array(n).keys())
}

function MapError ({ children }: { children?: ReactNode }): JSX.Element {
  return <div className='w-full h-full flexc text-red-500'>{children}</div>
}
function MapTile ({ tile, select, selected = false }: { tile: Tile, select: (newx: number, newy: number)=>any, selected?: boolean }): JSX.Element {
  return (
    <div
      className={clsx('flexc text-[0.4rem] bg-gray-500', selected && 'border-black border-2')}
      onClick={() => select(tile.x, tile.y)}
    >
      {tile?.entity?.id ?? ''}
    </div>
  )
}

export function Map ({ tiles, select, selected }: { tiles: Tile[], select: (newx: number, newy: number)=>any, selected: [number, number] }): JSX.Element {
  const size = Math.sqrt(tiles.length)
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [offset, _] = useState<[number, number]>([Math.floor(size / 2) - 10, Math.floor(size / 2) - 10])

  if (!Number.isInteger(size)) {
    return <MapError>Error retrieving tile data.</MapError>
  }

  if (size > 20) {
    // TODO: setOffset
    return <MapError>Map size {'>'} 20 not yet implemented</MapError>
  }


  return (
    <div className='m-map'>
      {range(20*20).map((index) => {
        const [rowOffset, colOffset] = offset

        const row = rowOffset + Math.floor(index / 20)
        const col = colOffset + index % 20

        if (row < 0 || row >= size || col < 0 || col >= size) return <div key={index} />
        const tile = tiles[row*size + col]
        return <MapTile tile={tile} key={index} select={select} selected={col === selected[0] && row === selected[1]} />;
      })}
    </div>
  )
}