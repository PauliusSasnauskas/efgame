import App from "../../App";
import { ButtonView, TextView, ContainerView } from "../Component/index";
import GameScreen from "./GameScreen";
import PainterImage from "./PainterImage";

export default class MainScreen extends ContainerView {
    constructor(w : number, h : number) {
        super(w, h);

        this.setBackgroundColor("#c53");
        this.setBackgroundImage(new PainterImage("bg2", {sx: 0, sy: 0, w: App.getInstance().getW(), h: App.getInstance().getH()}));

        const buttonPlay = new ButtonView(224, 38, "Find a Game", {top: 10, left: 14});
        buttonPlay.setBackgroundImage(new PainterImage("bar", {sx: 0, sy: 2*38, w: 224, h: 38}))
        buttonPlay.setIcon(new PainterImage("menubuttons", {sx: 0, sy: 0, w: 26, h: 26}));
        buttonPlay.setOnClick(()=>{
            App.getInstance().showScreen(GameScreen);
        });
        this.appendChild(buttonPlay, 32, 224);

        const titleText = new TextView("EFGame");
        titleText.setFontSize(32);
        this.appendChild(titleText, 32, 192);

    }
}