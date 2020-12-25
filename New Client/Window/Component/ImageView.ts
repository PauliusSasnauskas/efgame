import View from "./View";
import Painter from "./Painter";

export default class ImageView implements View {
    private img : HTMLImageElement | string;

    constructor(img : HTMLImageElement | string) {
        this.img = img;
    }
    draw(painter: Painter, x : number, y : number): void {
        painter.drawImg(x, y, this.img);
    }
}