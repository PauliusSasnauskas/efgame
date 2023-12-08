import { ServerStat } from "../ConfigSpec"

export class StatAction implements ServerStat {
  val = 8
  max = 12
  hiddenMax = 200
}

export class StatArmy implements ServerStat {
  val = 20
  hiddenMax = 200
}

export class StatGold implements ServerStat {
  val = 350
  hiddenMax = 20000
}

export class StatXp implements ServerStat {
  val = 0
}

export class StatTerritory implements ServerStat {
  val = 1
}
