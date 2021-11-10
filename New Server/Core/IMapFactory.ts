import Map from "./Map";

export default interface IMapFactory {
    createMap(size : number, userCount : number) : Map;
}