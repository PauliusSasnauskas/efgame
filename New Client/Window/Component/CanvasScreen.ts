import { Painter, Screen } from "./index";

export default abstract class CanvasScreen implements Screen {
    abstract show(painter : Painter) : void;
    unshow(painter : Painter) : void {
        painter.unregisterAllListeners();
    }
}