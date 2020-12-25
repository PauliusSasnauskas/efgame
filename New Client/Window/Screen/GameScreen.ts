import App from "../../App";
import { ButtonView, ContainerView } from "../Component/index";
import MainScreen from "./MainScreen";

export default class GameScreen extends ContainerView {
    constructor(w : number, h : number) {
        super(w, h);

        this.setBackgroundColor("#8f6");

        const buttonBack = new ButtonView(192, 32, "< Back", {top: 5, left: 10});
        buttonBack.setFontSize(16);
        buttonBack.setBackgroundColor("#333");
        buttonBack.setOnClick(()=>{
            App.getInstance().showScreen(MainScreen);
        });
        
        this.appendChild(buttonBack, 32, 384);
    }
}