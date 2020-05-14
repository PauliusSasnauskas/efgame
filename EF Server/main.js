const http = require('http');
const app = http.createServer((req, res)=>{ console.log("[log] Starting http."); });
app.listen(7777);
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
class slog {
    static log(message, uid = "") {
        let d = new Date();
        readline.cursorTo(process.stdout, 0);
        rl.output.write((uid == "" ? "[log] " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + " " : uid + ": ") + message + "\n");
    }
    static promptInput() {
        rl.question('', (input) => {
            let cmd = input.split(/\ (.+)/);
            let params = [];
            if (cmd[1] != null) { params = cmd[1].split(/\ /); }

            // cmd[0] - command
            // cmd[1] - args
            // params=[] - args split

            switch (cmd[0]) {
                // CONSOLE COMMANDS
                case "say":
                    io.emit('message', "server: " + cmd[1]);
                    this.log(cmd[1], "server");
                    break;
                case "users":
                    //this.log(cmd[1], "server");
                    console.log("Users: " + game.countUsers(), "server");
                    for (let user of game.game.usersstats){
                        console.log("[" + user.id + "] " + user.name + " c:" + user.color + " team:" + user.team);
                    }
                    break;
                case "user":
                    if (cmd[1] != null){
                        if (params[0] != null && params[1] != null && params[2] != null){
                            switch (params[1]){
                                case "name":
                                    for (let userstats of game.game.usersstats){
                                        if (userstats.id == params[0]){
                                            userstats.name = params[2];
                                            break;
                                        }
                                    }
                                break;
    
                            }
                        }
                    }//*/
                    //this.log(cmd[1], "server");
                    for (let user of game.game.usersstats){
                        if (user.id == cmd[1]){
                            console.log("[" + user.id + "] " + user.name + " c:" + user.color);
                            console.log("    ap:" + user.ap + " gold:" + user.gold + " army:" + user.army + " xp:" + user.xp);
                            break;
                        }
                    }
                    break;
                case "lobby":
                    game.game.state = 0;
                    game.game.turn = 0;
                    game.game.showturn = 0;
                    game.map = [];
                    for (let userstats of game.game.usersstats){
                        userstats.eliminated = false;
                    }
                    sendUpdate();
                    break;
                case "addBot":
                    let d = new Date();
                    let botid = params[0] != null ? params[0] : d.toLocaleTimeString("lt-LT");
                    let team = params[1] != null ? parseInt(params[1]) : 0;
                    if (team > game.game.teams){ team = 0; slog.log("Bot assigned to team 0; game teams limit: " + game.game.teams); }
                    game.newUserStats(botid, "Bot " + botid, Math.floor(Math.random() * 17), team);
                    sendUpdate();
                    break;
                case "map":
                    console.log(game.map);
                    break;
                case "start":
                    game.start();
                    sendUpdate();
                    slog.log("Game started");
                    break;
                case "turn":
                    game.nextTurn();
                    sendUpdate();
                    break;
                default:
                    console.log("[err] No command found: ", cmd[0]);
                    break;
            }
            slog.promptInput();
        });
    }
}
var io = require('socket.io').listen(app);
const Game = require('./Game.js');
var game = new Game("EFGAME Game Server");
console.log("[log] Server started.");
io.on('connection', onConnect);
slog.promptInput();
function onConnect(socket) {
    io.emit('message', JSON.stringify(socket.id + ' connected to the server!'));
    slog.log(socket.id + " connected! " + socket.handshake/* .address */);

    socket.on("usersettings", (usersettings)=>{
        //usersettings = JSON.parse(usersettings);
        game.newUserStats(socket.id, usersettings.name, usersettings.color);
        slog.log("Welcomed user " + socket.id + ", sending meta...");
        socket.emit('meta', game.meta(socket.id));
    });

    socket.on('chat', (message)=>{
        slog.log(message, socket.id);
        io.emit('message', JSON.stringify(socket.id + ": " + message));
    });

    socket.on("gamesettings", (gamesettings)=>{
        if (game.game.usersstats[0].id != socket.id){
            slog.log("Illegal serversetting change: " + socket.id);
            return;
        }
        var bundle = JSON.parse(gamesettings);
        switch (bundle.key){
            case "size":
                game.game.size += bundle.value;
                if (game.game.size > 35){ game.game.size = 35; };
                if (game.game.size < 10){ game.game.size = 10; };
                slog.log("size changed to " + game.game.size);
                break;
            case "maptype":
                let maptypes = ["RMG", "Island", "Empty"];

                game.game.type += bundle.value;
                if (game.game.type > 2){ game.game.type = 0; };
                if (game.game.type < 0){ game.game.type = 2; };
                slog.log("maptype changed to " + game.game.type + " (" + maptypes[game.game.type] + ")");
                break;
            case "teams":
                game.game.teams += bundle.value;
                if (game.game.teams > 4){ game.game.teams = 4; };
                if (game.game.teams < 0){ game.game.teams = 0; };
                slog.log("teams changed to " + game.game.teams);
                break;
        }
        sendUpdate();
    });

    socket.on("team", (team)=>{
        let userstats = game.getUserStats(socket.id);
        userstats.team = team;
        sendUpdate();
    });

    socket.on("startgame", ()=>{
        if (game.game.usersstats[0].id != socket.id){
            slog.log("Illegal serversetting change: " + socket.id);
            return;
        }
        if (game.game.state > 0){
            slog.log("Illegal gamestart: " + socket.id);
            return;
        }

        game.start();
        slog.log("Game started");
        sendUpdate();
    });

    socket.on("attack", (pos)=>{
        game.attack(socket.id, pos.x, pos.y);
        sendUpdate();
    });

    socket.on("leave", (pos)=>{
        game.leave(socket.id, pos.x, pos.y);
        sendUpdate();
    });

    socket.on("build", (post)=>{
        game.build(socket.id, post.x, post.y, post.type);
        sendUpdate();
    });

    socket.on("destroy", (pos)=>{
        game.destroy(socket.id, pos.x, pos.y);
        sendUpdate();
    });

    socket.on("repair", (pos)=>{
        game.repair(socket.id, pos.x, pos.y);
        sendUpdate();
    });

    socket.on("transfer", (pos)=>{
        game.transfer(socket.id, pos.x, pos.y);
        sendUpdate();
    });

    socket.on("endturn", ()=>{
        if (!game.isUserTurn(socket.id)){ return; }
        game.nextTurn();
        sendUpdate();
    });


    socket.on("error", (error) => {
        slog.log(socket.id + " got error: " + error + ". " + socket.handshake.address);
    });
    socket.on("disconnect", (reason) => {
        slog.log(socket.id + " disconnected, " + reason + ". " + socket.handshake.address);
        game.destroyUserStats(socket.id);
    });
}


function sendUpdate(){
    let clients = Object.keys(io.sockets.sockets);
    for (let client of clients){
        io.to(client).emit("update", game.meta(client));
        //console.log("sending update");
    }
    //console.log(game.map);
    //io.emit("update", game.meta());
}