import { ServerStat } from "../ConfigSpec"

export class StatAction extends ServerStat {
  val = 8
  max = 12
  hiddenMax = 200
}

export class StatArmy extends ServerStat {
  val = 20
  hiddenMax = 200
}

export class StatGold extends ServerStat {
  val = 350
  hiddenMax = 20000
}

export class StatXp extends ServerStat {
  val = 0
}

export class StatTerritory extends ServerStat {
  val = 1
}
