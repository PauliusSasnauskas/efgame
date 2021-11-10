import { PainterImage } from "../index";
import { ButtonView } from "../../Component/index";

export default class CommonComponents {
    private constructor() {}

    private static buttonPadding = {top: 10, left: 10};
    private static w = 224;
    private static h = 38;

    public static makeButton(text : string, onClick : ()=>void) : ButtonView {
        const buttonView = new ButtonView(this.w, this.h, text, this.buttonPadding);
        buttonView.setBackgroundImage(new PainterImage("bars", {sx: 0, sy: 2*38, w: this.w, h: this.h}));
        buttonView.setOnClick(onClick);
        return buttonView;
    }
    public static makeIconButton(text : string, iconTop : number, onClick : ()=>void) : ButtonView {
        const buttonView = this.makeButton(text, onClick);
        buttonView.setIcon(new PainterImage("menuIcons", {sx: 0, sy: iconTop*26, w: 26, h: 26}));
        return buttonView;
    }
}