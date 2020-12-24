import App from "../../App";
import { ButtonView, CanvasScreen, TextView, Painter } from "../Component/index";
import GameScreen from "./GameScreen";

export default class MainScreen extends CanvasScreen {
    show(painter : Painter): void {
        painter.drawRect(0, 0, 640, 480, "#c53");

        const button1 = new ButtonView(32, 224, 192, 32, "Play", 5);
        button1.setBackgroundColor("#333");
        button1.setOnClick(()=>{
            App.getInstance().showScreen(GameScreen);
        });
        button1.draw(painter);

        const titleText = new TextView(32, 192, "EFGame");
        titleText.setFontSize(32);
        titleText.draw(painter);
    }
}