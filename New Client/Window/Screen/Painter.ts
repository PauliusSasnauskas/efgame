import { PainterImage } from ".";

export declare type ImageParams = {sx : number, sy : number, w : number, h : number};

export default interface Painter {
	// setFillPattern(img : HTMLImageElement | string, repetition : string) : void;
	// setFillColor(color : string) : void;
	// setStrokeColor(color : string) : void;
	drawRect(x : number, y : number, w : number, h : number, color : string) : void;
	drawImg(x: number, y: number, img: PainterImage, imgParams? : ImageParams): void;
	drawText(x : number, y : number, text : string, fontSize : number, fontColor : string) : void;
	registerClickListener(listener : (e : MouseEvent) => void) : void;
	unregisterClickListener(listener : (e : MouseEvent) => void) : void;
	unregisterAllListeners() : void;
}