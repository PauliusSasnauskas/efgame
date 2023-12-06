import ConfigSpec from "./ConfigSpec"

const config: ConfigSpec = {
  name: 'Vanilla',
  version: '1',
  actions: {
    // 'v:attack': AttackAction,
    // 'endturn': null,
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
    // 'v:tree1': { img: tree1EntityIcon },
    // 'v:tree2': { img: tree2EntityIcon },
    // 'v:tree3': { img: tree3EntityIcon },
    // 'v:bush1': { img: bush1EntityIcon },
    // 'v:rock1': { img: rock1EntityIcon },
    // 'v:mountain1': { img: mountain1EntityIcon },
    // 'v:capitol': CapitolBuilding,
    // 'v:mine': MineBuilding,
    // 'v:barracks': BarracksBuilding,
    // 'v:tower': TowerBuilding,
    // 'v:woodwall': WoodWall,
    // 'v:stonewall': StoneWall,
  },
  resources: {
    // 'v:gold': { img: goldResourceIcon },
  },
  stats: {
    // 'v:action': { img: actionStatIcon },
    // 'v:gold': { img: goldStatIcon },
    // 'v:army': { img: armyStatIcon },
    // 'v:territory': { img: territoryStatIcon },
    // 'v:xp': { img: xpStatIcon },
  },
}

export default config