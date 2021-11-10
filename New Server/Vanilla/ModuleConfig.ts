import VanillaGameLogic from "./VanillaGameLogic";

import ActionAttack from "./Actions/ActionAttack";
import ResourceGold from "./Resources/ResourceGold";
import StatGold from "./UserStats/StatGold";
import StatAction from "./UserStats/StatAction";
import StatArmy from "./UserStats/StatArmy";
import StatXp from "./UserStats/StatXp";

let options = {
    gameLogic: VanillaGameLogic,
    actions: [
        ActionAttack,
        ActionLeave,
        ActionRepair,
        ActionTransferGold,
        ActionDemolish,
    ],
    entities: [
        Base,
        Mine,
        Barracks,
        Watchtower,
        WallWood,
        WallStone,
    ],
    resources: [
        ResourceGold,
    ],
    userStats: [
        StatGold,
        StatAction,
        StatArmy,
        StatXp,
    ],
};

export default options;