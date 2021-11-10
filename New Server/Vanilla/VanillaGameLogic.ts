import GameLogic from "../Core/GameLogic";
import User from "../Core/User";

export default class VanillaGameLogic extends GameLogic {
    private static instance: VanillaGameLogic;
    private constructor() {
        super();
    }
    public static getInstance() : VanillaGameLogic {
        if (!VanillaGameLogic.instance) {
            VanillaGameLogic.instance = new VanillaGameLogic();
        }
        return VanillaGameLogic.instance;
    }

    // this.currentTurnUser : User
    // this.map : Map;
    // this.state : GameState;
    // this.users : Array<User>;
    // this.turnEvents : Array<TurnEvent>;
    // this.actions : Array<ITileAction>;

    onEliminate(whom: User, who: User): void {
        throw new Error("Method not implemented.");
    }
    isWinCondition(): boolean {
        throw new Error("Method not implemented.");
    }
    turnChange() {
        super.turnChange();
        // do turn things
    }
}