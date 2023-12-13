import { ReactNode, useEffect, useState } from "react"
import { Tile } from "common/src/Tile"
import MapTile from "./MapTile"
import { PlayerDTO } from "common/src/Player"


function range (n: number): number[] {
  return Array.from(Array(n).keys())
}

function MapError ({ children }: { children?: ReactNode }): JSX.Element {
  return <div className='w-full h-full flexc text-red-500'>{children}</div>
}

export function Map ({ tiles, mapSize, select, selected, player, gameKey }: { tiles: Tile[], mapSize: number, select: (newx: number, newy: number) => void, selected: [number, number], player?: PlayerDTO, gameKey: string }): JSX.Element {
  const initialOffset = [Math.floor(mapSize / 2) - 10, Math.floor(mapSize / 2) - 10]
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [offset, setOffset] = useState<[number, number]>([0, 0])

  const [oldMap, setOldMap] = useState<{[k: number]: {[k: number]: Tile}}>(Object.assign({}, ...range(mapSize).map((i) => ({ [i]: {} }))))

  useEffect(() => {
    const updateOldMap = oldMap
    tiles.forEach((tile) => updateOldMap[tile.x][tile.y] = {...tile, owner: tile.owner?.name === player?.name ? undefined : tile.owner})
    setOldMap(updateOldMap)

    return () => setOldMap(Object.assign({}, ...range(mapSize).map((i) => ({ [i]: {} }))))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles, mapSize])

  useEffect(() => setOldMap(Object.assign({}, ...range(mapSize).map((i) => ({ [i]: {} })))), [gameKey, mapSize])

  if (mapSize === 0 || tiles.length === 0) {
    return <MapError>Error retrieving tile data.</MapError>
  }

  if (mapSize > 20) {
    // TODO: support for larger maps
    return <MapError>Map size {'>'} 20 not yet implemented</MapError>
  }

  function getTile(x: number, y: number, includeOld: boolean = false): Tile | undefined {
    let tile = tiles?.find((tile: Tile) => tile.x === x && tile.y === y)
    if (includeOld && tile === undefined) tile = oldMap[x][y]
    return tile
  }

  function checkTileBorders(tile: Tile | undefined, size: number): string | undefined {
    if (tile === undefined) return undefined
    const tileOwner = tile.owner?.name
    if (tileOwner === undefined) return undefined
    const x = tile.x
    const y = tile.y
    const borderTop = y === 0 || getTile(x, y-1, true)?.owner?.name !== tileOwner ? '1' : '0'
    const borderRight = x === size-1 || getTile(x+1, y, true)?.owner?.name !== tileOwner ? '1' : '0'
    const borderBottom = y === size-1 || getTile(x, y+1, true)?.owner?.name !== tileOwner ? '1' : '0'
    const borderLeft = x === 0 || getTile(x-1, y, true)?.owner?.name !== tileOwner ? '1' : '0'
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
        let tile = getTile(col, row)
        let old = false
        if (tile === undefined) {
          tile = oldMap[col][row]
          if (tile !== undefined) old = true
        }
        const borders = checkTileBorders(tile, mapSize)
        return <MapTile tile={tile} x={col} y={row} key={index} select={select} selected={col === selected[0] && row === selected[1]} borders={borders} old={old} />
      })}
    </div>
  )
}