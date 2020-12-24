import View from "./View";
import Painter from "./Painter";

export default class ImageView extends View {
    private img : HTMLImageElement | string;

    constructor(x : number, y : number, img : HTMLImageElement | string) {
        super(x, y);
        this.img = img;
    }
    draw(painter: Painter): void {
        painter.drawImg(this.getDrawX(), this.getDrawY(), this.img);
    }
}