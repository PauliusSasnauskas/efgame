import ConfigSpec from "./ConfigSpec"
import generateMapRMG from "./vanilla/MapRMG"
import { StatAction, StatArmy, StatGold, StatTerritory, StatXp } from "./vanilla/Stats"
import { AttackAction, BuildBarracksAction, BuildCapitolAction, BuildMineAction, BuildStoneWallAction, BuildTowerAction, BuildWoodWallAction, DemolishAction, LeaveAction, RepairAction, TransferAction } from "./vanilla/Actions"
import { Barracks, Capitol, Mine, StoneWall, Tower, WoodWall } from "./vanilla/Building"
import { checkWinner, getMapForPlayer, processEndTurnForPlayer } from "./vanilla/GameLogic"

const config: ConfigSpec = {
  name: 'Vanilla',
  version: '1',
  actions: {
    'v:attack': AttackAction,
    'v:buildcapitol': BuildCapitolAction,
    'v:buildmine': BuildMineAction,
    'v:buildbarracks': BuildBarracksAction,
    'v:buildtower': BuildTowerAction,
    'v:buildwoodwall': BuildWoodWallAction,
    'v:buildstonewall': BuildStoneWallAction,
    'v:transfer': TransferAction,
    'v:repair': RepairAction,
    'v:leave': LeaveAction,
    'v:demolish': DemolishAction,
  },
  entities: {
    'v:tree1': null,
    'v:tree2': null,
    'v:tree3': null,
    'v:bush1': null,
    'v:rock1': null,
    'v:mountain1': null,
    'v:capitol': Capitol,
    'v:mine': Mine,
    'v:barracks': Barracks,
    'v:tower': Tower,
    'v:woodwall': WoodWall,
    'v:stonewall': StoneWall,
  },
  resources: {
    'v:gold': null,
  },
  stats: {
    'v:action': StatAction,
    'v:gold': StatGold,
    'v:army': StatArmy,
    'v:territory': StatTerritory,
    'v:xp': StatXp,
  },
  mapNames: {
    "RMG": generateMapRMG
  },
  getMapForPlayer: getMapForPlayer,
  processEndTurnForPlayer: processEndTurnForPlayer,
  checkWinner: checkWinner
}

export default config
