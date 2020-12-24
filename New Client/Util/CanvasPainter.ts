import Painter from "./Painter.js";

export default class CanvasPainter implements Painter {
    private canvas : HTMLCanvasElement;
    private c : CanvasRenderingContext2D;

    private fontFamily = "";

    constructor(canvas : HTMLCanvasElement) {
        this.canvas = canvas;
        const context = this.canvas.getContext("2d");
        if (context === null){
            throw new Error("Canvas cannot get a 2D context.");
        }
        this.c = context;
    }

    drawRect(x: number, y: number, w: number, h: number, color: string): void {
        this.c.fillStyle = color;
        this.c.fillRect(x, y, w, h);
    }
    drawImg(x: number, y: number, img: string | HTMLImageElement): void {
        let canvasImage : CanvasImageSource;
        if (typeof img === "string"){
            canvasImage = new Image();
            // canvasImage.onload = ()=>{};
            canvasImage.src = img;
        }else{
            canvasImage = img;
        }
        this.c.drawImage(canvasImage, x, y);
    }
    drawText(x: number, y: number, text: string, fontSize: number, fontColor: string): void {
        this.c.font = fontSize + "px " + this.fontFamily;
        this.c.fillStyle = fontColor;
        this.c.fillText(text, x, y);
    }
}