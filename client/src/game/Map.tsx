import { ReactNode, WheelEvent, useEffect, useState } from "react"
import { Tile } from "common/src/Tile"
import MapTile from "./MapTile"
import { PlayerDTO } from "common/src/Player"

const offsetScrollThreshold = 3

function range (n: number): number[] {
  return Array.from(Array(n).keys())
}

function MapError ({ children }: { children?: ReactNode }): JSX.Element {
  return <div className='w-full h-full flexc text-red-500'>{children}</div>
}

function ifOneSetZero (val: number): number {
  return val === 1 ? 0 : val
}

export function Map ({ tiles, mapSize, select, selected, player, gameKey }: { tiles: Tile[], mapSize: number, select: (newx: number, newy: number) => void, selected: [number, number], player?: PlayerDTO, gameKey: string }): JSX.Element {
  const [offset, setOffset] = useState<[number, number]>([Math.floor(mapSize / 2) - 10, Math.floor(mapSize / 2) - 10])
  const [scrollOffsetInterval, setScrollOffsetInterval] = useState<NodeJS.Timeout | number | undefined>()
  const [oldMap, setOldMap] = useState<{[k: number]: {[k: number]: Tile}}>(Object.assign({}, ...range(mapSize).map((i) => ({ [i]: {} }))))

  useEffect(() => {
    const updateOldMap = oldMap
    tiles.forEach((tile) => updateOldMap[tile.x][tile.y] = {...tile, owner: tile.owner?.name === player?.name ? undefined : tile.owner})
    setOldMap(updateOldMap)

    return () => setOldMap(Object.assign({}, ...range(mapSize).map((i) => ({ [i]: {} }))))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles, mapSize])

  useEffect(() => {
    if (mapSize <= 20) return
    if (selected[0] < offset[0]+offsetScrollThreshold) setOffset((oldOffset) => [Math.max(0, ifOneSetZero(selected[0]-offsetScrollThreshold)), oldOffset[1]])
    if (selected[1] < offset[1]+offsetScrollThreshold) setOffset((oldOffset) => [oldOffset[0], Math.max(0, ifOneSetZero(selected[1]-offsetScrollThreshold))])
    if (selected[0] > offset[0]+17-offsetScrollThreshold) setOffset((oldOffset) => [Math.min(mapSize - 19, ifOneSetZero(selected[0] - 20 + 2 * offsetScrollThreshold)), oldOffset[1]])
    if (selected[1] > offset[1]+17-offsetScrollThreshold) setOffset((oldOffset) => [oldOffset[0], Math.min(mapSize-19, ifOneSetZero(selected[1]-20+2*offsetScrollThreshold))])
  }, [selected])

  useEffect(() => setOldMap(Object.assign({}, ...range(mapSize).map((i) => ({ [i]: {} })))), [gameKey, mapSize])

  if (mapSize === 0 || tiles.length === 0) {
    return <MapError>Error retrieving tile data.</MapError>
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

  const seeAllTop = mapSize <= 20 || offset[1] === 0
  const seeAllLeft = mapSize <= 20 || offset[0] === 0
  const seeAllBottom = mapSize <= 20 || offset[1] === mapSize - 19
  const seeAllRight = mapSize <= 20 || offset[0] === mapSize - 19

  const showCols = 20 - (seeAllLeft ? 0 : 1) - (seeAllRight ? 0 : 1)
  const showRows = 20 - (seeAllTop ? 0 : 1) - (seeAllBottom ? 0 : 1)

  const scrollBy = (scrollX: number, scrollY: number, callback?: (newX: number, newY: number) => void) => {
    if (mapSize <= 20) return
    setOffset((oldOffset) => {
      let newX = oldOffset[0] + scrollX
      let newY = oldOffset[1] + scrollY
      if (newX === 1 && scrollX > 0) newX = 2
      if (newX === 1 && scrollX < 0) newX = 0
      if (newY === 1 && scrollY > 0) newY = 2
      if (newY === 1 && scrollY < 0) newY = 0
      newX = Math.max(0, Math.min(mapSize-19, newX))
      newY = Math.max(0, Math.min(mapSize-19, newY))
      callback?.(newX, newY)
      return [newX, newY]
    })
  }

  const getScrollFn = (scrollX: number, scrollY: number) => () => {
    if (mapSize <= 20) return
    clearInterval(scrollOffsetInterval)
    scrollBy(scrollX, scrollY)
    setScrollOffsetInterval(setInterval(() => {
      scrollBy(scrollX, scrollY, (newX, newY) => {
        if (((newX === 0 || newX === mapSize-19) && scrollX !== 0) || ((newY === mapSize-19 || newY === 0) && scrollY !== 0)){
          setScrollOffsetInterval((scrollOffsetInterval) => {
            clearInterval(scrollOffsetInterval)
            return undefined
          })
        }
      })
    }, 100))
  }
  const stopScroll = () => setScrollOffsetInterval((scrollOffsetInterval) => {
    clearInterval(scrollOffsetInterval)
    return undefined
  })

  const onWheel = (param: WheelEvent) => {
    if (mapSize <= 20) return
    if (param.shiftKey || param.nativeEvent.deltaX !== 0) {
      scrollBy(param.nativeEvent.deltaX > 0 ? 1 : param.nativeEvent.deltaY > 0 ? 1 : -1, 0)
    }else{
      scrollBy(0, param.nativeEvent.deltaY > 0 ? 1 : -1)
    }
  }

  return (
    <div className='m-map' onWheel={onWheel}>
      {!seeAllLeft && <div className='row-span-full col-start-1 col-end-2 flexc bg-grey-darker hover:text-grey-lighter cursor-pointer' onMouseDown={getScrollFn(-1, 0)} onMouseUp={stopScroll}>{'<'}</div>}
      {!seeAllRight && <div className='row-span-full col-start-[20] col-end-[21] flexc bg-grey-darker hover:text-grey-lighter cursor-pointer' onMouseDown={getScrollFn(1, 0)} onMouseUp={stopScroll}>{'>'}</div>}
      {!seeAllTop && <div className='col-span-full row-start-1 row-end-2 flexc text-vertical bg-grey-darker hover:text-grey-lighter cursor-pointer' onMouseDown={getScrollFn(0, -1)} onMouseUp={stopScroll}>{'<'}</div>}
      {!seeAllBottom && <div className='col-span-full row-start-[20] row-end-[21] flexc text-vertical bg-grey-darker hover:text-grey-lighter cursor-pointer' onMouseDown={getScrollFn(0, 1)} onMouseUp={stopScroll}>{'>'}</div>}
      {range(showRows*showCols).map((index) => {
        const [colOffset, rowOffset] = offset

        const row = rowOffset + Math.floor(index / showCols)
        const col = colOffset + index % showCols

        if (row < 0 || row >= mapSize || col < 0 || col >= mapSize) return <div className='bg-black' key={index} />
        let tile = getTile(col, row)
        let old = false
        if (tile === undefined) {
          tile = oldMap[col][row]
          if (tile !== undefined) old = true
        }
        const borders = checkTileBorders(tile, mapSize)
        return <MapTile tile={tile} x={col} y={row} key={`${col}x${row}`} select={select} selected={col === selected[0] && row === selected[1]} borders={borders} old={old} />
      })}
    </div>
  )
}