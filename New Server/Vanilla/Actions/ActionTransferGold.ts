import User from "../../Core/User";
import ITileAction from "../../Core/ITileAction";
import TileClaimable from "../../Core/TileClaimable";

export default class ActionTransferGold extends ITileAction {
    static readonly id : string = "va:transfer";

    invoke(who: User, tile : TileClaimable) : void {
        if (tile.owner === undefined) return;
        if (who.team === 0 || tile.owner.team !== who.team) return;
        // TODO: check userstats
        tile.owner.userstats.get(ActionTransferGold.id)!.add(50);
        who.userstats.get(ActionTransferGold.id)!.subtract(50);
    }
}