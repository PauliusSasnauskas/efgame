import { Painter } from "./index";

export default interface Screen {
    show(painter : Painter) : void;
    unshow(painter : Painter) : void;
}