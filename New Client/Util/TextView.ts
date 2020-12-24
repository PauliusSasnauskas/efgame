import View from "./View";
import Painter from "./Painter";

export default class TextView extends View {
    private text : string;
    private fontSize : number = 16;
    private fontColor : string = "#fff";

    constructor(x : number, y : number, text : string) {
        super(x, y);
        this.text = text;
    }
    setFontSize(fontSize : number): void {
        this.fontSize = fontSize;
    }
    setFontColor(fontColor : string): void {
        this.fontColor = fontColor;
    }
    getFontSize() : number {
        return this.fontSize;
    }
    getFontColor() : string {
        return this.fontColor;
    }
    setX(x : number) {
        this.x = x;
    }
    setY(y : number) {
        this.y = y;
    }
    draw(painter: Painter): void {
        painter.drawText(this.getDrawX(), this.getDrawY(), this.text, this.fontSize, this.fontColor);
    }
}