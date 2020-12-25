import { Painter, View } from ".";

export default interface ViewGroup extends View {
    draw(painter : Painter, x : number, y : number) : void;
    appendChild(child : View, x : number, y : number): void;
}