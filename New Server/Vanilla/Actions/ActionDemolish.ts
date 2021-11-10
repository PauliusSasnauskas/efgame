import ITileAction from "../../Core/ITileAction";
import TileClaimable from "../../Core/TileClaimable";
import IVanillaEntity from "../Entities/IVanillaEntity";
import User from "../../Core/User";

export default class ActionDemolish implements ITileAction {
    readonly id : string = "va:demolish";

    invoke(who: User, tile : TileClaimable) : void {
        if (tile.owner !== who) return;
        if (tile.entity === undefined) return;
        // TODO: check userstats
        (tile.entity as IVanillaEntity).demolish();
    }
}