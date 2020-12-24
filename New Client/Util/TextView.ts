import View from "./View.js";
import Painter from "./Painter.js";

export default class TextView extends View {
    private text : string;
    private fontSize : number = 8;
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
    draw(painter: Painter): void {
        painter.drawText(this.getDrawX(), this.getDrawY(), this.text, this.fontSize, this.fontColor);
    }
}