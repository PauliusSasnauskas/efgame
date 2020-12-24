import Painter from "./Painter.js";

export default abstract class View {
    x : number;
    y : number;

    parent : View | undefined;

    constructor(x : number, y : number){
        this.x = x;
        this.y = y;
    }

    abstract draw(painter : Painter): void;

    getDrawX() : number {
        return (this.parent?.getDrawX() ?? 0) + this.x;
    }
    getDrawY() : number {
        return (this.parent?.getDrawY() ?? 0) + this.y;
    }
}