import { PainterImage } from "../index";
import App from "../../../App";
import { ButtonView, ContainerView } from "../../Component/index";
import MainScreen from "./MainScreen";

export default class GameScreen extends ContainerView {
    constructor(w : number, h : number) {
        super(w, h);

        this.setBackgroundColor("#886");
        this.setBackgroundImage(new PainterImage("bg6", {sx: 0, sy: 0, w: App.getInstance().getW(), h: App.getInstance().getH()}));

        const buttonBack = new ButtonView(192, 32, "< Back", {top: 5, left: 10});
        buttonBack.setFontSize(16);
        buttonBack.setBackgroundColor("#333");
        buttonBack.setOnClick(()=>{
            App.getInstance().showScreen(MainScreen);
        });
        
        this.appendChild(buttonBack, 32, 384);
    }
}