import View from "./View";
import Painter from "./Painter";

export default class TextView implements View {
    private text : string;
    private fontSize : number = 16;
    private fontColor : string = "#fff";

    constructor(text : string) {
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
    draw(painter: Painter, x : number, y : number): void {
        painter.drawText(x, y, this.text, this.fontSize, this.fontColor);
    }
}