import Painter from "./Painter";

export default interface View {
    draw(painter : Painter, x : number, y : number): void;
}