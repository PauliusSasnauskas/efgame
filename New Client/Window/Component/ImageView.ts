import { Painter, PainterImage, View } from "../Screen/index";

export default class ImageView implements View {
    private img : PainterImage;

    constructor(img : PainterImage) {
        this.img = img;
    }
    draw(painter: Painter, x : number, y : number): void {
        painter.drawImg(x, y, this.img);
    }
}