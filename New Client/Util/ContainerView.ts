import View from "./View";
import Painter from "./Painter";

export default class ContainerView extends View {
    private padding : number;
    private children : Array<View> = [];

    private width : number;
    private height : number;

    private backgroundColor : string | undefined = undefined;

    constructor(x : number, y : number, width : number, height : number, padding? : number) {
        super(x, y);
        this.width = width;
        this.height = height;
        this.padding = padding ?? 0;
    }

    appendChild(child : View): void{
        this.children.push(child);
        child.parent = this;
    }

    setBackgroundColor(backgroundColor : string){
        this.backgroundColor = backgroundColor;
    }

    draw(painter: Painter): void {
        if (this.backgroundColor) painter.drawRect(this.x, this.y, this.width, this.height, this.backgroundColor);
        // TODO: draw frame
        for (let child of this.children){
            child.draw(painter);
        }
    }
    
    getDrawX() : number {
        return (this.parent?.getDrawX() ?? 0) + this.padding + this.x;
    }
    getDrawY() : number {
        return (this.parent?.getDrawY() ?? 0) + this.padding + this.y;
    }
    getW() : number {
        return this.width;
    }
    getH() : number {
        return this.height;
    }
}