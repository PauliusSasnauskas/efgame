import { Painter, ViewGroup } from "./Window/Screen/index";

declare type Class<T = any> = new (...args: any[]) => T;

export default class App {
    private currentScreen : ViewGroup;
    private painter : Painter;
    private static _ref? : App;

    private w : number;
    private h : number;

    private fontLoaded = false;
    private imagesLoaded = 0;
    private imagesToLoad = ["bars", "bg6", "bg7", "bg8", "menuIcons"];
    private loadedImages : Map<string, CanvasImageSource> = new Map();
    private onLoadResources? : (() => void);

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

    setOnLoadResources(callback : (() => void)){
        this.onLoadResources = callback;
    }
    
    loadResources() {
        if (this.imagesLoaded && this.fontLoaded) return;
        for (const image of this.imagesToLoad){
            const imageObj = new Image();
            imageObj.src = "img/" + image + ".png";
            this.loadedImages.set(image, imageObj);
            imageObj.onload = ()=>{
                this.imagesLoaded++;
                if (this.imagesLoaded !== this.imagesToLoad.length || this.onLoadResources === undefined || this.fontLoaded === false){ return }
                this.onLoadResources();
            };
        }
        (document as any).fonts.add(new (window as any).FontFace("nokiafc22", "url(./fonts/nokiafc22.ttf)"));
		(document as any).fonts.load("12px nokiafc22").then(() => {
            this.fontLoaded = true;
            if (this.imagesLoaded !== this.imagesToLoad.length || this.onLoadResources === undefined){ return }
            this.onLoadResources();
		});
    }
    getImage(name : string) : CanvasImageSource {
        if (this.imagesLoaded === 0) throw new Error("Images not loaded");
        const getImage = this.loadedImages.get(name);
        if (getImage === undefined) throw new Error("Image not loaded");
        return getImage;
    }
}