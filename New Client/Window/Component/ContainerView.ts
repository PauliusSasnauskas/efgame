import { PainterImage, Painter, View, ViewGroup } from "../Screen/index";

export declare type TopLeft = {top : number, left : number}

export default class ContainerView implements ViewGroup {
    private padding : TopLeft;
    private children : Array<{v : View, x : number, y : number}> = [];

    private width : number;
    private height : number;

    private backgroundColor? : string;
    private backgroundImage? : PainterImage;

    constructor(width : number, height : number, padding? : TopLeft) {
        this.width = width;
        this.height = height;
        this.padding = padding ?? {top: 0, left: 0};
    }

    appendChild(child : View, x : number, y : number): void{
        this.children.push({v: child, x, y});
    }

    setBackgroundColor(backgroundColor : string){
        this.backgroundColor = backgroundColor;
    }

    setBackgroundImage(bgImg : PainterImage){
        this.backgroundImage = bgImg;
    }

    draw(painter: Painter, x : number, y : number): void {
        if (this.backgroundColor) { painter.drawRect(x, y, this.width, this.height, this.backgroundColor); }
        if (this.backgroundImage) { painter.drawImg(x, y, this.backgroundImage); }
        // TODO: add frame and/or background
        for (let child of this.children){
            child.v.draw(painter, x+this.padding.left+child.x, y+this.padding.top+child.y);
        }
    }
    getW() : number {
        return this.width;
    }
    getH() : number {
        return this.height;
    }
}