import { BarracksBuilding, CapitolBuilding, MineBuilding, StoneWall, TowerBuilding, WoodWall } from "./game/vanilla/Buildings"
import { AttackAction, BuildBarracksAction, BuildCapitolAction, BuildMineAction, BuildStoneWallAction, BuildTowerAction, BuildWoodWallAction, RepairAction } from "./game/vanilla/Actions"

import demolishActionIcon from './img/vanilla/actions/demolish.svg'
import leaveActionIcon from './img/vanilla/actions/leave.svg'
import transferActionIcon from './img/vanilla/actions/transfer.svg'

import tree1EntityIcon from './img/vanilla/entities/tree1.svg'
import tree2EntityIcon from './img/vanilla/entities/tree2.svg'
import tree3EntityIcon from './img/vanilla/entities/tree3.svg'
import bush1EntityIcon from './img/vanilla/entities/bush1.svg'
import rock1EntityIcon from './img/vanilla/entities/rock1.svg'
import mountain1EntityIcon from './img/vanilla/entities/mountain1.svg'

import goldResourceIcon from './img/vanilla/resources/gold.svg'

import actionStatIcon from './img/vanilla/stats/action.svg'
import goldStatIcon from './img/vanilla/stats/gold.svg'
import armyStatIcon from './img/vanilla/stats/army.svg'
import territoryStatIcon from './img/vanilla/stats/territory.svg'
import xpStatIcon from './img/vanilla/stats/xp.svg'
import ConfigSpec from "./ConfigSpec"

const config: ConfigSpec = {
  name: 'Vanilla',
  version: '1',
  actions: {
    'v:attack': { key: 'KeyA', impl: AttackAction },
    'endturn': null,
    'v:buildcapitol': { key: ['Numpad1', 'Digit1'], impl: BuildCapitolAction },
    'v:buildmine': { key: ['Numpad2', 'Digit2'], impl: BuildMineAction },
    'v:buildbarracks': { key: ['Numpad3', 'Digit3'], impl: BuildBarracksAction },
    'v:buildtower': { key: ['Numpad4', 'Digit4'], impl: BuildTowerAction },
    'v:buildwoodwall': { key: ['Numpad5', 'Digit5'], impl: BuildWoodWallAction },
    'v:buildstonewall': { key: ['Numpad6', 'Digit6'], impl: BuildStoneWallAction },
    'v:transfer': { key: 'KeyT', impl: { img: transferActionIcon, name: 'Transfer 50 Gold', req: { 'v:action': 1, 'v:gold': 50 } } },
    'v:repair': { key: 'KeyR', impl: RepairAction },
    'v:leave': { key: 'KeyL', impl: { img: leaveActionIcon, name: "Leave", req: { 'v:action': 1 } } },
    'v:demolish': { key: 'KeyD', impl: { img: demolishActionIcon, name: 'Demolish', req: { 'v:action': 1, 'v:army': 1 } } },
  },
  entities: {
    'v:tree1': { img: tree1EntityIcon },
    'v:tree2': { img: tree2EntityIcon },
    'v:tree3': { img: tree3EntityIcon },
    'v:bush1': { img: bush1EntityIcon },
    'v:rock1': { img: rock1EntityIcon },
    'v:mountain1': { img: mountain1EntityIcon },
    'v:capitol': CapitolBuilding,
    'v:mine': MineBuilding,
    'v:barracks': BarracksBuilding,
    'v:tower': TowerBuilding,
    'v:woodwall': WoodWall,
    'v:stonewall': StoneWall,
  },
  resources: {
    'v:gold': { img: goldResourceIcon },
  },
  stats: {
    'v:action': { img: actionStatIcon },
    'v:gold': { img: goldStatIcon },
    'v:army': { img: armyStatIcon },
    'v:territory': { img: territoryStatIcon },
    'v:xp': { img: xpStatIcon },
  },
}

export default config