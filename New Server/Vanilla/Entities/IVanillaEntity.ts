import IEntity from "../../Core/IEntity";
import User from "../../Core/User";
import GameLogic, { GameState } from "../../Core/GameLogic";
import VanillaGameLogic from "../VanillaGameLogic";

export default abstract class IVanillaEntity extends IEntity {
    constructor(healthInitial : number) {
        super(healthInitial);
    }
    abstract attack(who : User) : void;
    abstract repair(who : User) : void;
    demolish(who : User) : void {
        // TODO: check userstats
        VanillaGameLogic.getInstance().removeOnTurnChange(this);
    }
}