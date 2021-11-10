import Config from "./Config.json";

export default class Server {
    private name : string = Config.name;
    private port : number = Config.port;
    private maxPlayers : number = Config.maxPlayers;
}