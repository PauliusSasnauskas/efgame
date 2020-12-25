import View from "./View";
import Painter from "./Painter";
import { ContainerView, TextView } from "./index";

export default class ButtonView implements View {

    private containerView : ContainerView;
    private textView : TextView;
    private listener?: () => void;

    constructor(w : number, h : number, text : string, padding? : number) {
        this.textView = new TextView(text);
        this.containerView = new ContainerView(w, h, padding ?? 0);
        this.containerView.appendChild(this.textView, 0, this.textView.getFontSize());
    }
    setBackgroundColor(backgroundColor: string): void {
        this.containerView.setBackgroundColor(backgroundColor);
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