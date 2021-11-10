import { PainterImage } from "../index";
import App from "../../../App";
import { ContainerView } from "../../Component/index";
import MainScreen from "./MainScreen";
import CommonComponents from "./CommonComponents";

export default class GameScreen extends ContainerView {
    constructor(w : number, h : number) {
        super(w, h);

        this.setBackgroundColor("#886");
        this.setBackgroundImage(new PainterImage("bg6", {sx: 0, sy: 0, w: App.getInstance().getW(), h: App.getInstance().getH()}));
        
        this.appendChild(CommonComponents.makeButton("< Back", ()=>{
            App.getInstance().showScreen(MainScreen);
        }), 32, 640);
    }
}