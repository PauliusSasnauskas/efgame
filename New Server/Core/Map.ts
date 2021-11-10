import Tile from "./Tile";

export default class Map {
    public readonly size : number;
    private tiles : Array<Array<Tile>>;

    public constructor(tiles : Array<Array<Tile>>, size : number) {
        this.tiles = tiles;
        this.size = size;
    }

    public getTile(x : number, y : number) : Tile {
        if (x >= this.size || x < 0 ||
            y >= this.size || y < 0) throw new Error("Cannot select a tile outside the map.");
        return this.tiles[x][y];
    }
}