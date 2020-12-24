import { Painter, Screen, CanvasPainter } from "./Window/Component/index";

declare type Class<T = any> = new (...args: any[]) => T;

export default class App {
    private currentScreen : Screen;
    private painter : Painter;
    private static _ref? : App;

    private constructor(width : number, height : number, element: HTMLCanvasElement, InitialScreen : Class<Screen>)  {
        const canvasElement = element;
        canvasElement.width = width;
        canvasElement.height = height;
        this.painter = new CanvasPainter(canvasElement);

        this.currentScreen = new InitialScreen();
        this.currentScreen.show(this.painter);
    }

    static init(width : number, height : number, element: HTMLCanvasElement, InitialScreen : Class<Screen>) {
        this._ref = new App(width, height, element, InitialScreen);
    }

    showScreen(S : Class<Screen>) : void {
        this.currentScreen.unshow(this.painter);
        this.currentScreen = new S();
        this.currentScreen.show(this.painter);
    }

    static getInstance() : App {
        if (this._ref === undefined){
            throw new Error("App not started?");
        }
        return this._ref;
    }
}