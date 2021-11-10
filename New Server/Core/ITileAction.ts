import TileClaimable from "./TileClaimable";
import User from "./User";

export default abstract class ITileAction {
    /* abstract */ static readonly id : string;

    abstract invoke(who : User, tile : TileClaimable) : void;
}