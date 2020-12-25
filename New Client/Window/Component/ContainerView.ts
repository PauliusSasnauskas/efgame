import { Painter, View, ViewGroup } from ".";

export default class ContainerView implements ViewGroup {
    private padding : number;
    private children : Array<{v : View, x : number, y : number}> = [];

    private width : number;
    private height : number;

    private backgroundColor? : string;

    constructor(width : number, height : number, padding? : number) {
        this.width = width;
        this.height = height;
        this.padding = padding ?? 0;
    }

    appendChild(child : View, x : number, y : number): void{
        this.children.push({v: child, x, y});
    }

    setBackgroundColor(backgroundColor : string){
        this.backgroundColor = backgroundColor;
    }

    draw(painter: Painter, x : number, y : number): void {
        if (this.backgroundColor) { painter.drawRect(x, y, this.width, this.height, this.backgroundColor); }
        // TODO: add frame and/or background
        for (let child of this.children){
            child.v.draw(painter, x+this.padding+child.x, y+this.padding+child.y);
        }
    }
    getW() : number {
        return this.width;
    }
    getH() : number {
        return this.height;
    }
}