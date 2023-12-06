import ConfigSpec from "./ConfigSpec"
import generateMapRMG from "./vanilla/MapRMG"
import { StatAction, StatArmy, StatGold, StatTerritory, StatXp } from "./vanilla/Stats"

const config: ConfigSpec = {
  name: 'Vanilla',
  version: '1',
  actions: {
    // 'v:attack': AttackAction,
    // 'v:buildcapitol': BuildCapitolAction,
    // 'v:buildmine': BuildMineAction,
    // 'v:buildbarracks': BuildBarracksAction,
    // 'v:buildtower': BuildTowerAction,
    // 'v:buildwoodwall': BuildWoodWallAction,
    // 'v:buildstonewall': BuildStoneWallAction,
    // 'v:transfer': { img: transferActionIcon, name: 'Transfer 50 Gold', req: { 'v:action': 1, 'v:gold': 50 } },
    // 'v:repair': RepairAction,
    // 'v:leave': { img: leaveActionIcon, name: "Leave", req: { 'v:action': 1 } },
    // 'v:demolish': { img: demolishActionIcon, name: 'Demolish', req: { 'v:action': 1, 'v:army': 1 } },
  },
  entities: {
    'v:tree1': {},
    'v:tree2': {},
    'v:tree3': {},
    'v:bush1': {},
    'v:rock1': {},
    'v:mountain1': {},
    // 'v:capitol': CapitolBuilding,
    // 'v:mine': MineBuilding,
    // 'v:barracks': BarracksBuilding,
    // 'v:tower': TowerBuilding,
    // 'v:woodwall': WoodWall,
    // 'v:stonewall': StoneWall,
  },
  resources: {
    'v:gold': {},
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
  }
}

export default config
