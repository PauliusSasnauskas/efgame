import App from "../../App";
import { ButtonView, TextView, ContainerView } from "../Component/index";
import GameScreen from "./GameScreen";

export default class MainScreen extends ContainerView {
    constructor(w : number, h : number) {
        super(w, h);

        this.setBackgroundColor("#c53");

        const buttonPlay = new ButtonView(192, 32, "Play", 5);
        buttonPlay.setBackgroundColor("#333");
        buttonPlay.setOnClick(()=>{
            App.getInstance().showScreen(GameScreen);
        });
        this.appendChild(buttonPlay, 32, 224);

        const titleText = new TextView("EFGame");
        titleText.setFontSize(32);
        this.appendChild(titleText, 32, 192);
    }
}