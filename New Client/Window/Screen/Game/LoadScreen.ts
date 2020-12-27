import App from "../../../App";
import { ContainerView, TextView } from "../../Component/index";
import MainScreen from "./MainScreen";

export default class GameScreen extends ContainerView {
    constructor(w : number, h : number) {
        super(w, h);

        this.setBackgroundColor("#aaa");
        
        this.appendChild(new TextView("Loading..."), 16, 32);

        setTimeout(()=>{
            App.getInstance().setOnLoadResources(()=>{
                App.getInstance().showScreen(MainScreen);
            });
            App.getInstance().loadResources();
        }, 100);
    }
}