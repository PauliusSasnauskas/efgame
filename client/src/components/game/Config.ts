import { Bush1Decoration, Mountain1Decoration, Rock1Decoration, Tree1Decoration, Tree2Decoration, Tree3Decoration } from "./vanilla/Decorations";
import { GoldResource } from "./vanilla/GoldResource";
import { BarracksBuilding, CapitolBuilding, MineBuilding, StoneWall, TowerBuilding, WoodWall } from "./vanilla/VanillaBuilding";

const config = {
  actions: [
    // AttackAction,
    // LeaveAction,
    // // // EndTurnAction,
    // RepairAction,
    // DemolishAction,
    // TransferAction,
  ],
  entities: {
    'v:tree1': Tree1Decoration,
    'v:tree2': Tree2Decoration,
    'v:tree3': Tree3Decoration,
    'v:bush1': Bush1Decoration,
    'v:rock1': Rock1Decoration,
    'v:mountain1': Mountain1Decoration,
    'v:capitol': CapitolBuilding,
    'v:mine': MineBuilding,
    'v:barracks': BarracksBuilding,
    'v:tower': TowerBuilding,
    'v:woodwall': WoodWall,
    'v:stonewall': StoneWall,
  } as {[k: string]: any},
  resources: {
    'v:gold': GoldResource,
  } as {[k: string]: any},
  stats: [
    // ActionStat,
    // ArmyStat,
    // GoldStat,
    // TerritoryStat,
    // XpStat,
  ],
}

export default config