import { StatReq } from "../Player";

export const buildingInfo: {[k: string]: { repairReq: StatReq, maxHealth: number, destroyXpReward: number, buildReq?: StatReq, xpReq?: number }} = {
  'v:capitol': { repairReq: { 'v:action': 3, 'v:gold': 230, 'v:army': 2 }, maxHealth: 3, destroyXpReward: 15 },
  'v:mine': { repairReq: { 'v:action': 2, 'v:gold': 35, 'v:army': 3 }, maxHealth: 2, destroyXpReward: 10, buildReq: { 'v:action': 6, 'v:gold': 125 } },
  'v:barracks': { repairReq: { 'v:action': 2, 'v:gold': 50, 'v:army': 3 }, maxHealth: 2, destroyXpReward: 10, buildReq: { 'v:action': 6, 'v:gold': 100 } },
  'v:tower': { repairReq: { 'v:action': 2, 'v:gold': 50, 'v:army': 1 }, maxHealth: 2, destroyXpReward: 5, buildReq: { 'v:action': 4, 'v:gold': 90, 'v:army': 1 }, xpReq: 25 },
  'v:woodwall': { repairReq: { 'v:action': 1, 'v:gold': 30, 'v:army': 1 }, maxHealth: 4, destroyXpReward: 8, buildReq: { 'v:action': 4, 'v:gold': 115, 'v:army': 3 }, xpReq: 50 },
  'v:stonewall': { repairReq: { 'v:action': 1, 'v:gold': 30, 'v:army': 1 }, maxHealth: 7, destroyXpReward: 15, buildReq: { 'v:action': 7, 'v:gold': 180, 'v:army': 5 }, xpReq: 135 }
}