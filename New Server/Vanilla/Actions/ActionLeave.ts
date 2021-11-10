import ITileAction from "../../Core/ITileAction";
import TileClaimable from "../../Core/TileClaimable";
import User from "../../Core/User";

export default class ActionLeave implements ITileAction {
    readonly id : string = "va:leave";

    invoke(who: User, tile : TileClaimable) : void {
        // TODO: check userstats
        if (tile.owner !== who) return;
        if (tile.entity !== undefined) return;
        tile.owner = undefined;
    }
}