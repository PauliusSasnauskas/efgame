import App from "../../../App";
import { TextView, ContainerView } from "../../Component/index";
import GameScreen from "./GameScreen";
import PainterImage from "../PainterImage";
import SettingsScreen from "./SettingsScreen";
import CommonComponents from "./CommonComponents";

export default class MainScreen extends ContainerView {
    constructor(w : number, h : number) {
        super(w, h);

        // Set background
        this.setBackgroundColor("#c53");
        this.setBackgroundImage(new PainterImage("bg8", {sx: 0, sy: 0, w: App.getInstance().getW(), h: App.getInstance().getH()}));

        const buttons = [
            {x: 32, y: 374, text: "Find a Game", iconTop: 0, onClick: ()=>App.getInstance().showScreen(GameScreen)},
            {x: 32, y: 462, text: "Settings", iconTop: 3, onClick: ()=>App.getInstance().showScreen(SettingsScreen)},
        ];

        for (const button of buttons){
            const { text, iconTop, onClick, x, y } = button;
            const bV = CommonComponents.makeIconButton(text, iconTop, onClick);
            this.appendChild(bV, x, y);
        }

        const titleText = new TextView("EFGame");
        titleText.setFontSize(32);
        this.appendChild(titleText, 32, 292);

    }
}