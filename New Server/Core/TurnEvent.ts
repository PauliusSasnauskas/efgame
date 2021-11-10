import IEntity from "./IEntity";
import GameLogic from "./GameLogic";

export default interface TurnEvent {
    sender : IEntity;
    invoke(entity : IEntity, gameLogic : GameLogic) : void;
}