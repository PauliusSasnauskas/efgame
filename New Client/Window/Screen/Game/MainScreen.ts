import App from "../../../App";
import { ButtonView, TextView, ContainerView } from "../../Component/index";
import GameScreen from "./GameScreen";
import PainterImage from "../PainterImage";
import SettingsScreen from "./SettingsScreen";

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

        const padding = {top: 10, left: 10};

        for (const button of buttons){
            const w = 224;
            const h = 38;
            const buttonView = new ButtonView(w, h, button.text, padding);
            buttonView.setBackgroundImage(new PainterImage("bars", {sx: 0, sy: 2*38, w, h}));
            buttonView.setIcon(new PainterImage("menuIcons", {sx: 0, sy: button.iconTop*26, w: 26, h: 26}));
            buttonView.setOnClick(button.onClick);
            this.appendChild(buttonView, button.x, button.y);
        }

        const titleText = new TextView("EFGame");
        titleText.setFontSize(32);
        this.appendChild(titleText, 32, 292);

    }
}