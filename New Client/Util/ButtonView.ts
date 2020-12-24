import View from "./View";
import Painter from "./Painter";
import { ContainerView, TextView } from "./index";

export default class ButtonView extends View {

    private containerView : ContainerView;
    private textView : TextView;
    private unregisterListener?: (e : MouseEvent) => void;
    private listener?: (e : MouseEvent) => void;
    private isDrawn : boolean = false;

    constructor(x : number, y : number, w : number, h : number, text : string, padding? : number) {
        super(x, y);
        this.textView = new TextView(0, 0, text);
        this.textView.setY(this.textView.getFontSize());
        this.containerView = new ContainerView(x, y, w, h, padding ?? 0);
        this.containerView.appendChild(this.textView);
    }
    appendChild(child: View): void {
        this.containerView.appendChild(child);
    }
    setBackgroundColor(backgroundColor: string): void {
        this.containerView.setBackgroundColor(backgroundColor);
    }
    setFontSize(fontSize : number): void {
        this.textView.setFontSize(fontSize);
        this.textView.setY(fontSize);
    }
    setFontColor(fontColor : string): void {
        this.textView.setFontColor(fontColor);
    }
    draw(painter: Painter): void {
        if (this.unregisterListener !== undefined){
            painter.unregisterClickListener(this.unregisterListener);
            this.unregisterListener = undefined;
        }
        this.containerView.draw(painter);
        if (this.listener !== undefined){
            painter.registerClickListener(this.listener);
            this.isDrawn = true;
        }
    }
    setOnClick(listener : () => void){
        if (this.isDrawn && listener !== undefined){
            this.unregisterListener = listener;
            this.isDrawn = false;
        }
        this.listener = (e : MouseEvent) => {
            const cX = this.containerView.getDrawX();
            const cY = this.containerView.getDrawY();
            if (   e.offsetX >= cX
                && e.offsetX <= cX + this.containerView.getW()
                && e.offsetY >= cY
                && e.offsetY <= cY + this.containerView.getH()) {
                listener();
            }
        };
    }
}