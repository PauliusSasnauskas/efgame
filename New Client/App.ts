import { Painter, ViewGroup } from "./Window/Component/index";

declare type Class<T = any> = new (...args: any[]) => T;

export default class App {
    private currentScreen : ViewGroup;
    private painter : Painter;
    private static _ref? : App;

    private w : number;
    private h : number;

    private constructor(width : number, height : number, painter: Painter, InitialScreen : Class<ViewGroup>)  {
        this.w = width;
        this.h = height;
        this.painter = painter;

        this.currentScreen = new InitialScreen(this.w, this.h);
        this.currentScreen.draw(this.painter, 0, 0);
    }

    getW() : number {
        return this.w;
    }
    getH() : number {
        return this.h;
    }

    static init(width : number, height : number, element: Painter, InitialScreen : Class<ViewGroup>) {
        this._ref = new App(width, height, element, InitialScreen);
    }

    showScreen(S : Class<ViewGroup>) : void {
        this.painter.unregisterAllListeners();
        this.currentScreen = new S(this.w, this.h);
        this.currentScreen.draw(this.painter, 0, 0);
    }

    static getInstance() : App {
        if (this._ref === undefined){
            console.log("App not started?");
            throw new Error("App not started?");
        }
        return this._ref;
    }
}