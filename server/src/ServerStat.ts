import { Stat } from "common/src/Player"

export default /* abstract */ class ServerStat implements Stat {
  val: string | number = 0
  max?: number | undefined
  hiddenMax?: number | undefined

  constructor () {}
}
