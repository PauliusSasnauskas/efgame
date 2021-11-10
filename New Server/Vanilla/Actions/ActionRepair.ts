import ITileAction from "../../Core/ITileAction";
import TileClaimable from "../../Core/TileClaimable";
import User from "../../Core/User";
import IVanillaEntity from "../Entities/IVanillaEntity";

export default class ActionRepair implements ITileAction {
    readonly id : string = "va:repair";

    invoke(who: User, tile : TileClaimable) : void {
        if (tile.owner !== who) return;
        if (tile.entity === undefined) return;
        (tile.entity as IVanillaEntity).repair(who);
    }
}