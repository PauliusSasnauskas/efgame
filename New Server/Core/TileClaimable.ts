import Tile from "./Tile";
import IEntity from "./IEntity";
import IResource from "./IResource";
import User from "./User";

export default class TileClaimable extends Tile {
    readonly x!: number;
    readonly y!: number;

    owner ?: User;

    entity ?: IEntity;
    resource ?: IResource;

    constructor(x : number, y : number) {
        super(x, y);
        this.owner = undefined;
        this.entity = undefined;
        this.resource = undefined;
    }
}