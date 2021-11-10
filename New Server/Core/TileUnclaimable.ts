import Tile from "./Tile";

export default class TileUnclaimable extends Tile {
    readonly x : number;
    readonly y : number;
    readonly type : number;

    constructor(x : number, y : number, type : number) {
        super(x, y);
        this.type = type;
    }
}