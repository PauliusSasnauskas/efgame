import { default as User, UserState } from "./User";
import Map from "./Map";
import TurnEvent from "./TurnEvent";
import ITileAction from "./ITileAction";
import MapFactory from "./IMapFactory";
import IEntity from "./IEntity";

export default abstract class GameLogic {
    protected turn : number = 0;
    currentTurnUser ?: User = undefined;


    map ?: Map = undefined;
    state : GameState = GameState.Preparation;
    users : Array<User> = [];
    turnEvents : Array<TurnEvent> = [];

    abstract onEliminate(whom : User, who : User) : void;
    abstract isWinCondition() : boolean;

    // constructor() {
    // }

    onTurnChange(event : TurnEvent) {
        this.turnEvents.push(event);
    }

    removeOnTurnChange(sender : IEntity) {
        // remove all events where the sender is sender
        this.turnEvents = this.turnEvents.filter((event) => (event.sender !== sender));
    }

    turnChange() {
        if (this.state !== GameState.Running) return;
        if (this.currentTurnUser === undefined) return;

        this.turn++;

        do {
            let userNum : number = this.users.indexOf(this.currentTurnUser);
            userNum++;
            if (userNum >= this.users.length) userNum = 0;
            this.currentTurnUser = this.users[userNum];
        } while (this.currentTurnUser.state != UserState.Active);

        if (this.isWinCondition()) {
            this.state = GameState.Finished;
            return;
        }

        this.turnEvents.forEach((event) => {
            event.invoke(event.sender, this);
        });
    }

    start(mapFactory : MapFactory, size : number) {
        if (this.state !== GameState.Preparation) return;
        this.map = mapFactory.createMap(size, this.users.length);
        this.turn = 0;
        let startingUser = Math.floor(this.users.length * Math.random());
        this.currentTurnUser = this.users[startingUser];
        this.state = GameState.Running;
    }

    end() {
        if (this.state === GameState.Preparation) return;
        this.state = GameState.Preparation;
    }
}

export enum GameState {
    Preparation,
    Running,
    Finished,
}
