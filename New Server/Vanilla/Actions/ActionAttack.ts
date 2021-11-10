import ITileAction from "../../Core/ITileAction";
import TileClaimable from "../../Core/TileClaimable";
import IVanillaEntity from "../Entities/IVanillaEntity";
import User from "../../Core/User";

export default class ActionAttack implements ITileAction {
    readonly id : string = "va:attack";

    invoke(who: User, tile : TileClaimable) : void {
        if (tile.owner === who) return;
        // TODO: check userstats
        if (tile.entity !== undefined) {
            (<IVanillaEntity>tile.entity).attack(who);
            return;
        }
        tile.owner = who;
    }
}