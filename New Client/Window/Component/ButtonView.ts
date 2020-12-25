import { Painter, PainterImage, View } from "../Screen/index";
import { TopLeft } from "./ContainerView";
import { ContainerView, TextView } from "./index";

export default class ButtonView implements View {

    private containerView : ContainerView;
    private textView : TextView;
    private listener?: () => void;

    constructor(w : number, h : number, text : string, padding? : TopLeft) {
        this.textView = new TextView(text);
        this.containerView = new ContainerView(w, h, padding);
        this.containerView.appendChild(this.textView, 0, this.textView.getFontSize());
    }
    setBackgroundColor(backgroundColor: string): void {
        this.containerView.setBackgroundColor(backgroundColor);
    }
    setBackgroundImage(bgImg : PainterImage){
        this.containerView.setBackgroundImage(bgImg);
    }
    setFontSize(fontSize : number): void {
        this.textView.setFontSize(fontSize);
    }
    setFontColor(fontColor : string): void {
        this.textView.setFontColor(fontColor);
    }
    draw(painter : Painter, x : number, y : number): void{
        this.containerView.draw(painter, x, y);

        if (this.listener === undefined) { return; }

        const listenerCopy = this.listener;
        painter.registerClickListener((e : MouseEvent) => {
            if (   e.offsetX >= x
                && e.offsetX <= x + this.containerView.getW()
                && e.offsetY >= y
                && e.offsetY <= y + this.containerView.getH()) {
                listenerCopy();
            }
        });
    }
    setOnClick(listener : () => void){
        this.listener = listener;
    }
}