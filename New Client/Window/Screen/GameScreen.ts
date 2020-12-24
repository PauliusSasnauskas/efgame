import { CanvasScreen, Painter } from "../Component/index";

export default class GameScreen extends CanvasScreen {
    show(painter: Painter): void {
        painter.drawRect(0, 0, 640, 480, "#8f6");
    }
}