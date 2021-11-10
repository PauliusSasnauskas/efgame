import IUserStat from "./IUserStat";
import User from "./User";
import TileClaimable from "./TileClaimable";

export default abstract class IEntity {
    static readonly STATE_INITIAL = 0;

    /* static */ abstract readonly id : string;
    health : number;
    state : number;

    constructor(healthInitial : number) {
        this.health = healthInitial;
        this.state = IEntity.STATE_INITIAL;
    }

    /* static */ abstract build(user : User, tile : TileClaimable) : void;
    abstract getBuildReq(user : User) : IUserStat;
}