import ServerStat from "../ServerStat";

export class StatAction extends ServerStat {
  val: number = 8
  max: number = 12
}

export class StatArmy extends ServerStat {
  val: number = 20
}

export class StatGold extends ServerStat {
  val: number = 350
  hiddenMax: number = 20000
}

export class StatXp extends ServerStat {
  val: number = 0
}

export class StatTerritory extends ServerStat {
  val: number = 1
}
