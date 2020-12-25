import { ImageParams } from "./Painter";

export default class PainterImage {
    private src : string;
    private params? : ImageParams;

    constructor(src : string, params? : ImageParams){
        this.src = src;
        this.params = params;
    }

    getSrc() : string {
        return this.src;
    }

    getParams() : ImageParams | undefined {
        return this.params;
    }
}