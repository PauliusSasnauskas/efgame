import IUserStat from "./IUserStat";
import { default as GameLogic, GameState } from "./GameLogic";

export default class User {
    id : number;
    name : string;
    color : string;
    team : number = 0;

    game : GameLogic;
    state : UserState;
    userstats : Map<String, IUserStat>;

    constructor(game : GameLogic, id : number, name : string, color : string, userstats : Map<String, IUserStat>) {
        this.id = id;
        this.name = name;
        this.color = color;

        this.game = game;

        switch (this.game.state) {
            case GameState.Preparation:
                this.state = UserState.Active; break;
            default:
                this.state = UserState.Spectating; break;
        }

        this.userstats = userstats;
    }

    spectate() {
        if (this.state === UserState.Active && this.game.state !== GameState.Preparation) return;
        if (this.state === UserState.Eliminated && true /* TODO: still has teammates */) return;
        this.state = UserState.Spectating;
    }

    unspectate() {
        if (this.state !== UserState.Spectating) return;
        if (this.game.state !== GameState.Preparation) return;
        this.state = UserState.Active;
    }

    forfeit() {
        if (this.state !== UserState.Active) return;
        this.state = UserState.Eliminated;
    }
}

export enum UserState {
    Active,
    Eliminated,
    Spectating,
}