import { ServerStat } from "../ConfigSpec"

export class StatAction implements ServerStat {
  val: number = 8
  max: number = 12
}

export class StatArmy implements ServerStat {
  val: number = 20
}

export class StatGold implements ServerStat {
  val: number = 350
  hiddenMax: number = 20000
}

export class StatXp implements ServerStat {
  val: number = 0
}

export class StatTerritory implements ServerStat {
  val: number = 1
}
