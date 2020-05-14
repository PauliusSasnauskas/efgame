// userstats = {id, name, color, team, eliminated};

class Game {
    constructor(name) {
        this.game = {
            type: 0,
            size: 10,
            usersstats: [],
            turn: 0,
            showturn: 0,
            spectators: [],
            state: 0,
            teams: 0,
            log: [],
            name: name
        };
        this.map = [];
    }

    // -------- SERVER FUNCTIONS -------- //

    countUsers(){
        return this.game.usersstats.length;
    }

    // -------- GAME FUNCTIONS -------- //

    start(){
        this.game.log = [];
        this.game.state = 1;
        this.generateMap();
    }

    generateMap(){
        const MAP_RMG = 0;
        const MAP_ISLAND = 1;
        const MAP_EMPTY = 2;

        console.log("[log] Generating map...");
        let size = this.game.size;
        let type = this.game.type;
        let tiles = [];

        let nature, theme, ntl;

        switch (type){
            case MAP_RMG:
                nature = [[0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0],
                              [0, 3, 3, 0, 0, 7, 0, 0, 0, 0, 1, 0 ,0, 0, 0, 7, 0, 0, 0, 0],
                              [4, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]];
                theme = Math.floor(Math.random() * nature.length);
    
                ntl = nature[theme].length;
                for (let i = 0; i < size; i++){
                    tiles[i] = [];
                    for (let j = 0; j < size; j++){
                        tiles[i][j] = { x: i, y: j, nature: nature[theme][Math.floor(Math.random() * ntl)], owner: 0, team: 0, building: 0, health: 0 };
                    }
                }
    
                for (let userstats of this.game.usersstats){ // Make town hall for each player
                    let ub_x = Math.floor(Math.random() * size);
                    let ub_y = Math.floor(Math.random() * size);
    
                    let userbase = tiles[ub_x][ub_y];
                    userbase.owner = userstats.id;
                    userbase.team = userstats.team;
                    userbase.building = 1;
                    userbase.health = 3;
                    userbase.nature = 0;
                    tiles[ub_x][ub_y] = userbase;
                    
                    tiles[(ub_x == 0 ? ub_x+1 : ub_x-1)][ub_y].nature = 1;
                }
            break;
            case MAP_ISLAND:
                let radius = size/2-1;
                let nature_border = 2 + Math.floor(Math.random() * 6);

                nature = [[0, 0, 4, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                              [0, 3, 3, 0, 0, 7, 0, 0, 0, 0, 1, 0 ,0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                              [4, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
                theme = Math.floor(Math.random() * nature.length);
                ntl = nature[theme].length;

                // Generate round arena
                for (let i = 0; i < size; i++){
                    tiles[i] = [];
                    for (let j = 0; j < size; j++){
                        if (Math.pow(size/2 - i, 2) + Math.pow(size/2 - j, 2) > radius*radius){
                            tiles[i][j] = { x: i, y: j, nature: nature_border, owner: 0, team: 0, building: 0, health: 0 };
                        }else{
                            tiles[i][j] = { x: i, y: j, nature: nature[theme][Math.floor(Math.random() * ntl)], owner: 0, team: 0, building: 0, health: 0 };
                        }
                    }
                }

                for (let userstats of this.game.usersstats){ // Make town hall for each player
                    // TODO: future change x, y to angle and distance from center
                    //let angle;
                    //let dist;

                    let ub_x = Math.floor(Math.random() * size);
                    let ub_y = Math.floor(Math.random() * size);
                    while (Math.pow(size/2 - ub_x, 2) + Math.pow(size/2 - ub_y, 2) > radius*radius){
                        ub_x = Math.floor(Math.random() * size);
                        ub_y = Math.floor(Math.random() * size);
                    }
                    console.log("x: " + ub_x + " y: " + ub_y);
    
                    let userbase = tiles[ub_x][ub_y];
                    userbase.owner = userstats.id;
                    userbase.team = userstats.team;
                    userbase.building = 1;
                    userbase.health = 3;
                    userbase.nature = 0;
                    tiles[ub_x][ub_y] = userbase;
                    
                    tiles[(ub_x == 0 ? ub_x+1 : ub_x-1)][ub_y].nature = 1;
                }
            break;
            case MAP_EMPTY:
                for (let i = 0; i < size; i++){
                    tiles[i] = [];
                    for (let j = 0; j < size; j++){
                        tiles[i][j] = { x: i, y: j, nature: 0, owner: 0, team: 0, building: 0, health: 0 };
                    }
                }
                for (let i = 0, n = Math.floor(size/6 * (this.game.usersstats.length)); i < n; i++){ // limited gold
                    let g_x = Math.floor(Math.random() * size);
                    let g_y = Math.floor(Math.random() * size);
                    tiles[g_x][g_y].nature = 1;
                }
                for (let userstats of this.game.usersstats){ // Make town hall for each player
                    let ub_x = Math.floor(Math.random() * size);
                    let ub_y = Math.floor(Math.random() * size);
    
                    let userbase = tiles[ub_x][ub_y];
                    userbase.owner = userstats.id;
                    userbase.team = userstats.team;
                    userbase.building = 1;
                    userbase.health = 3;
                    userbase.nature = 0;
                    tiles[ub_x][ub_y] = userbase;
                    
                    tiles[(ub_x == 0 ? ub_x+1 : ub_x-1)][ub_y].nature = 1;
                }
            break;
        }

        for (let userstats of this.game.usersstats){
            userstats.ap = 8;
            userstats.gold = 350;
            userstats.army = 20;
            userstats.xp = 0;
        }
        this.map = tiles;
    }

    setUserStats(uid, userstats){
        /*if (this.game.usersstats == null){
            this.game.usersstats = [];
        }//*/
        for (let i = 0, n = this.game.usersstats.length; i < n; i++) {
            if (this.game.usersstats[i].id == uid) {
                this.game.usersstats[i] = userstats;
                return true;
            }
        }
        return false;
    }

    newUserStats(uid, name, color){
        // Creates userstats for user
        let usercolors = ["255,255,255", "255,110,0", "255,0,0", "187,0,0", "187,255,0", "0,255,0", "0,192,0", "0,255,141", "0,255,255", "0,148,255", "0,38,255", "0,18,127", "255,250,0", "255,0,151", "255,0,255", "187,0,255"];
        let userstats_new;
        if (this.game.state == 0) {
            userstats_new = { id: uid, name: name, color: usercolors[color], team: 0, eliminated: false };
            this.game.usersstats.push(userstats_new);
        }else{
            console.log("[err] Game has already begun, cannot create new userstats");
        }
        return userstats_new;
    }

    getUserStats(uid) {
        /*if (this.game.usersstats == null){
            this.game.usersstats = [];
        }//*/
        // Returns userstats for user
        for (let i = 0, n = this.game.usersstats.length; i < n; i++) {
            if (this.game.usersstats[i].id == uid) {
                return this.game.usersstats[i];
            }
        }
    }

    destroyUserStats(uid) {
        for (let i = 0, n = this.game.usersstats.length; i < n; i++){
            if (this.game.usersstats[i].id == uid){
                this.game.usersstats.splice(i, 1);
                return;
            }
        }
        console.log("[err] Failed to destroy " + uid);
    }

    isUserTurn(uid){
        if (this.game.usersstats[(this.game.turn) % this.game.usersstats.length].id == uid) {
            return true;
        }
        return false;
    }

    nextTurn(){
        if (this.game.state != 1){ return; }
        let maxgold = 20000;
        let maxap = 200;

        let userstats = this.game.usersstats[(this.game.turn) % this.game.usersstats.length];

        // GOLD
        let mineOn  = 0;
        let mineOff = 0;
        for (let i = 0, size = this.game.size; i < size; i++){
            for (let j = 0; j < size; j++){
                let tile = this.map[i][j];
                if (tile.owner == userstats.id && tile.building == 2 && tile.health > 0){
                    tile.nature == 1 ? mineOn++ : mineOff++;
                }
            }
        }
        userstats.gold += 2;
        for (let i = 0; i < mineOn;  i++){ userstats.gold += 16 + Math.round(Math.random() * 4); }
        for (let i = 0; i < mineOff; i++){ userstats.gold +=  4 + Math.round(Math.random() * 4); }
        if (userstats.gold > maxgold){ userstats.gold = maxgold; }

        // AP
        let limap = 12 + Math.floor(userstats.xp / 8);
        if (limap > maxap){ limap = maxap; }

        let capitals = 0;
        let land = 0;
        for (let i = 0, size = this.game.size; i < size; i++){
            for (let j = 0; j < size; j++){
                if (this.map[i][j].owner == userstats.id){
                    land++;
                    if (this.map[i][j].building == 1){ capitals++; }
                }
            }
        }
        userstats.ap += 7 + capitals + Math.floor(land/70);
        if (userstats.ap > limap){ userstats.ap = limap; }

        this.game.usersstats[(this.game.turn) % this.game.usersstats.length] = userstats;

        this.game.turn++;
        this.game.showturn++;
        while (this.game.usersstats[(this.game.turn) % this.game.usersstats.length].eliminated){
            this.game.turn++;
        }
    }

    meta(uid, spectate = false){
        let send = Object.assign({}, this.game); // deep copy

        send.users = [];
        send.userstats = {};
        for (let userstats of this.game.usersstats){
            let user = {
                id: userstats.id,
                name: userstats.name,
                color: userstats.color,
                team: userstats.team,
                eliminated: userstats.eliminated
            };

            send.users.push(user)

            if (userstats.id == uid){
                spectate = false;
                send.userstats = Object.assign({}, userstats); // deep copy
            }
        }
        delete send.usersstats;
        
        if (send.state == 0) {
            return send;
        }

        let size = this.game.size;

        let userteam = send.userstats.team;

        let sendmap = [];
        let seemap = [];
        for (let i = 0; i < size; i++){
            sendmap[i] = [];
            seemap[i] = new Array(size).fill(false);
        }

        let seeDiamond = (x, y)=>{
            if (x-1 >= 0){
                if (y-1 >= 0  ){ seemap[x-1][y-1] = true; }
                                 seemap[x-1][y  ] = true;
                if (y+1 < size){ seemap[x-1][y+1] = true; }
            }

                if (y-1 >= 0  ){ seemap[x  ][y-1] = true; }
                                 seemap[x  ][y  ] = true;
                if (y+1 < size){ seemap[x  ][y+1] = true; }

            if (x+1 < size){
                if (y-1 >= 0  ){ seemap[x+1][y-1] = true; }
                                 seemap[x+1][y  ] = true;
                if (y+1 < size){ seemap[x+1][y+1] = true; }
            }
            if (x-2 >= 0  ){ seemap[x-2][y  ] = true; }
            if (x+2 < size){ seemap[x+2][y  ] = true; }
            if (y-2 >= 0  ){ seemap[x  ][y-2] = true; }
            if (y+2 < size){ seemap[x  ][y+2] = true; }
        };

        for (let i = 0; i < size; i++){
            for (let j = 0; j < size; j++){
                let tile = this.map[i][j];
                if (tile == undefined){ continue; }
                if (tile.owner == uid || (this.game.teams > 0 && userteam > 0 && tile.team == userteam)){   // Diamond 2
                    seeDiamond(tile.x, tile.y);
                }
                if ((tile.owner == uid || (this.game.teams > 0 && userteam > 0 && tile.team == userteam)) && tile.building == 4 && tile.health >= 1){  // Watchtower broken
                    // TODO: fix seemap

                    if (tile.x-1 >= 0){
                        if (tile.y-2 >= 0  ){ seemap[tile.x-1][tile.y-2] = true; }
                        if (tile.y+2 < size){ seemap[tile.x-1][tile.y+2] = true; }
                    }
                    if (tile.x+1 < size){
                        if (tile.y-2 >= 0  ){ seemap[tile.x+1][tile.y-2] = true; }
                        if (tile.y+2 < size){ seemap[tile.x+1][tile.y+2] = true; }
                    }
                    if (tile.x-2 >= 0){
                        if (tile.y-1 >= 0  ){ seemap[tile.x-2][tile.y-1] = true; }
                        if (tile.y+1 < size){ seemap[tile.x-2][tile.y+1] = true; }
                    }
                    if (tile.x+2 < size){
                        if (tile.y-1 >= 0  ){ seemap[tile.x+2][tile.y-1] = true; }
                        if (tile.y+1 < size){ seemap[tile.x+2][tile.y+1] = true; }
                    }

                }
                if ((tile.owner == uid || (this.game.teams > 0 && userteam > 0 && tile.team == userteam)) && tile.building == 4 && tile.health == 2){
                   
                    for (let k = -2; k <= 2; k++){
                        for (let l = -5; l <= 5; l++){
                            if (tile.x+k >= 0 && tile.x+k < size && tile.y+l >= 0 && tile.y+l < size){
                                seemap[tile.x+k][tile.y+l] = true;
                            }
                        }
                    }
                    for (let k = -5; k <= 5; k++){
                        if (k == -2){ k = 3; }
                        for (let l = -2; l <= 2; l++){
                            if (tile.x+k >= 0 && tile.x+k < size && tile.y+l >= 0 && tile.y+l < size){
                                seemap[tile.x+k][tile.y+l] = true;
                            }
                        }
                    }
                    for (let k = 3; k <= 4; k++){
                        for (let l = 3; l <= 4; l++){
                            if (k == 4 && l == 4){ break; }

                            if (tile.x+k < size){
                                if (tile.y+l < size){ seemap[tile.x+k][tile.y+l] = true; }
                                if (tile.y-l >= 0  ){ seemap[tile.x+k][tile.y-l] = true; }
                            }
                            if (tile.x-k >= 0){
                                if (tile.y+l < size){ seemap[tile.x-k][tile.y+l] = true; }
                                if (tile.y-l >= 0  ){ seemap[tile.x-k][tile.y-l] = true; }
                            }
                            
                        }
                    }
                }

            }
        }

        for (let i = 0; i < size; i++){
            for (let j = 0; j < size; j++){
                if (seemap[i][j]){
                    sendmap[i][j] = this.map[i][j];
                }
            }
        }

        //delete seemap; // unnecessary

        if (!spectate) {
            let countland = 0;
            let countth = 0;
            for (let i = 0; i < size; i++){
                for (let j = 0; j < size; j++){
                    let tile = this.map[i][j];
                    if (tile.owner == uid){ countland++; }
                    if (tile.building == 1){ countth++; }
                }
            }
            
            send.userstats.land = countland;
            send.userstats.th = countth;
        }

        send.map = sendmap;

        if (spectate){ send.map = this.map; }
        if (send.userstats.eliminated == true){ send.map = this.map; }
        //if (game.state != 1){ send.map = this.map; }

        return send;

        //*/
    }

    // -------- TILE FUNCTIONS -------- //

    attack(uid, x, y){
        let checkBound = (userstats, x, y)=>{
            let good_friend = 0;
            let friend = 0;
            let ms = this.game.size;
            if (x - 1 >= 0) {
                if (y - 1 >= 0) { friend += (this.map[x - 1][y - 1].owner == userstats.id ? 1 : 0); }
                if (y + 1 < ms) { friend += (this.map[x - 1][y + 1].owner == userstats.id ? 1 : 0); }
                if (this.map[x - 1][y].building == 1 && this.map[x - 1][y].owner == userstats.id) { return true; }
                good_friend += (this.map[x - 1][y].owner == userstats.id ? 1 : 0);
            }
        
            if (y - 1 >= 0) { good_friend += (this.map[x][y - 1].owner == userstats.id ? 1 : 0); }
            if (y + 1 < ms) { good_friend += (this.map[x][y + 1].owner == userstats.id ? 1 : 0); }
            if (y - 1 >= 0 && this.map[x][y - 1].building == 1 && this.map[x][y - 1].owner == userstats.id) { return true; }
            if (y + 1 < ms && this.map[x][y + 1].building == 1 && this.map[x][y + 1].owner == userstats.id) { return true; }
        
            if (x + 1 < ms) {
                if (y - 1 >= 0) { friend += (this.map[x + 1][y - 1].owner == userstats.id ? 1 : 0); }
                if (y + 1 < ms) { friend += (this.map[x + 1][y + 1].owner == userstats.id ? 1 : 0); }
                good_friend += (this.map[x + 1][y].owner == userstats.id ? 1 : 0);
                if (this.map[x + 1][y].building == 1 && this.map[x + 1][y].owner == userstats.id) { return true; }
            }
        
            if (good_friend >= 1 && friend >= 1) { return true; }
            if (good_friend >= 2) { return true; }
            return false;
        }

        if (!this.isUserTurn(uid)){ return; }
        let userstats = this.game.usersstats[(this.game.turn) % this.game.usersstats.length];

        let attacked = this.map[x][y];

        if (attacked == null){ return; }
        if (this.game.state != 1) { return; }
        if (attacked.nature > 1 || attacked.owner == uid) { return; }                  // Obstruction
        if (this.game.teams > 0 && userstats.team > 0 && attacked.team == userstats.team) { return; } // Teammate
        if (userstats.ap < 2 || userstats.army < 1) { return; }                                    // No resources
        if (!checkBound(userstats, x, y)) { return; }                                                                               // No two bounding tiles
        userstats.ap -= 2;
        userstats.army--;
        userstats.xp += (attacked.owner != 0 ? 1 : 0.25);
        this.setUserStats(uid, userstats);

        let size = this.game.size;

        if (attacked.owner != 0 && attacked.building > 0) {
            attacked.health--;
            if (attacked.health <= 0) {
                switch (attacked.building){
                    case 1: /* Town Hall */ userstats.xp += 15; break;
                    case 2: /* Mine */ userstats.xp += 10; break;
                    case 3: /* Barracks */ userstats.assignxp += 10; break;
                    case 4: /* Watchtower */ userstats.xp += 5; break;
                    case 5: /* Wood Wall */ userstats.xp += 8; break;
                    case 6: /* Stone Wall */ userstats.xp += 15; break;
                }
                if (attacked.building == 1){
                    let ath = 0;
                    for (let i = 0; i < size; i++){
                        for (let j = 0; j < size; j++){
                            let tile = this.map[i][j];
                            if (tile.owner == attacked.owner && tile.building == 1){ ath++; }
                        }
                    }
                    if (ath <= 1){
                        userstats.xp += 20;
                        // TODO: implement:
                        this.eliminate(attacked.owner, uid);
                    }
                }
                attacked.building = 0;
                attacked.owner = uid;
                attacked.team = userstats.team;

                // TODO: implement
                if (x+1 < size){ this.claimSides(uid, x+1, y, userstats.team) ? userstats.xp += 0.25 : 0; }
                if (x-1 >= 0){ this.claimSides(uid, x-1, y, userstats.team) ? userstats.xp += 0.25 : 0; }
                if (y+1 <size){ this.claimSides(uid, x, y+1, userstats.team) ? userstats.xp += 0.25 : 0; }
                if (y-1 >= 0){ this.claimSides(uid, x, y-1, userstats.team) ? userstats.xp += 0.25 : 0; }

                //this.map[x][y] = attacked;
            }
        } else {
            this.map[x][y].owner = uid;
            this.map[x][y].team = userstats.team;

            if (x+1 < size){ this.claimSides(uid, x+1, y, userstats.team) ? userstats.xp += 0.25 : 0; }
            if (x-1 >= 0){ this.claimSides(uid, x-1, y, userstats.team) ? userstats.xp += 0.25 : 0; }
            if (y+1 <size){ this.claimSides(uid, x, y+1, userstats.team) ? userstats.xp += 0.25 : 0; }
            if (y-1 >= 0){ this.claimSides(uid, x, y-1, userstats.team) ? userstats.xp += 0.25 : 0; }
            
        }
    }
    claimSides(uid, x, y, team){
        let size = this.game.size;

        if (this.map[x][y].owner == uid){ return false; } // Already owned
        if (this.map[x][y].building > 0 || this.map[x][y].nature > 1){ return false; }  // Obstruction
        if (x-1 < 0 || x+1 >= size || y-1 < 0 || y+1 >= size){ return false; }
        if (x+1 < size && this.map[x+1][y].owner != uid){ return false; } // Right
        if (x-1 >= 0 && this.map[x-1][y].owner != uid){ return false; }   // Left
        if (y+1 < size && this.map[x][y+1].owner != uid){ return false; } // Down
        if (y-1 >= 0 && this.map[x][y-1].owner != uid){ return false; }   // Up
        
        this.map[x][y].owner = uid;
        this.map[x][y].team = team;

        return true;
    }

    eliminate(elimid, attid){
        let eliminated = this.getUserStats(elimid);
        eliminated.eliminated = true;
        let attacker = this.getUserStats(attid);
        attacker.xp += 20;

        this.game.log.push({text: eliminated.name + " eliminated by " + attacker.name + " on turn " + this.game.showturn});

        let aliveteams = [];
        let alive = 0;
        let aliveuser;
        for (let userstats of this.game.usersstats){
            if (!userstats.eliminated){
                alive++;
                aliveuser = userstats;
                if (this.game.teams > 0 && !aliveteams.includes(userstats.team)){
                    aliveteams.push(userstats.team);
                }
            }
        }
        if (alive == 1 && this.game.teams == 0){
            this.game.log.push({text: aliveuser.name + " has won by eliminating all players!"});
            this.game.state = 2;
            console.log("[log] Game won by " + aliveuser.id);
        }
        if (this.game.teams > 0 && aliveteams.length == 1){
            this.game.log.push({text: "Team " + aliveteams[0] + " won by eliminating all teams!"});
            this.game.state = 2;
            console.log("[log] Game won by Team " + aliveteams[0]);
        }
    }

    leave(uid, x, y){
        if (!this.isUserTurn(uid)){ return; }
        let userstats = this.game.usersstats[(this.game.turn) % this.game.usersstats.length];
        if (this.map[x][y].nature > 1 || this.map[x][y].building > 0 || this.map[x][y].owner != uid){ return; } // Invalid tile
        if (userstats.ap < 1){ return; }

        this.map[x][y].owner = 0;
        this.map[x][y].team = 0;
        userstats.ap--;
    }
    
    build(uid, x, y, type){
        if (!this.isUserTurn(uid)){ return; }
        let userstats = this.game.usersstats[(this.game.turn) % this.game.usersstats.length];

        let built = this.map[x][y];

        if (built.owner != uid || built.building > 0){ return; } // Not your tile / no space for building

        let th = 0;      // number of town halls
        let barFull = 0; // number of healthy barracks
        let barDmgd = 0; // number of damaged barracks
        for (let i = 0, size = this.game.size; i < size; i++){
            for (let j = 0; j < size; j++){
                let tile = this.map[i][j];
                if (tile.owner == uid){
                    if (tile.building == 1){ th++; }
                    if (tile.building == 2 && tile.health > 0){
                        tile.health == 2 ? barFull++ : barDmgd++;
                    }
                }
            }
        }

        switch (type){
            case 1: // Town hall
                if (userstats.ap < 8) { return; }     // No AP
                if (userstats.gold < 475 + 25*th) { return; }  // No gold
                if (userstats.army < 6) { return; }   // No army
                if (userstats.xp < 125 + 25*th) { return; }    // No xp

                userstats.ap -= 8;
                userstats.gold -= 475 + 25*th;
                built.building = type;
                built.health = 3;


                break;
            case 2: // Mine
                if (userstats.ap < 6) { return; }     // No AP
                if (userstats.gold < 125) { return; } // No gold
                userstats.ap -= 6;
                userstats.gold -= 125;

                built.building = type;
                built.health = 2;
                break;
            case 3: // Barracks
                let maxarmy = 200;

                if (userstats.ap < 6) { return; }     // No AP
                if (userstats.gold < 100) { return; } // No gold
                userstats.ap -= 6;
                userstats.gold -= 100;

                userstats.army += 20 + 2 * barFull + barDmgd;

                built.building = type;
                built.health = 2;
                break;
            case 4: // Watchtower
                if (userstats.ap < 4) { return; }     // No AP
                if (userstats.gold < 90) { return; }  // No gold
                if (userstats.army < 1) { return; }   // No army
                if (userstats.xp < 25) { return; }    // No xp
                userstats.ap -= 4;
                userstats.gold -= 90;
                userstats.army -= 1;

                built.building = type;
                built.health = 2;
                break;
            case 5: // Wood Wall
                if (userstats.ap < 4) { return; }     // No AP
                if (userstats.gold < 115) { return; } // No gold
                if (userstats.army < 3) { return; }   // No army
                if (userstats.xp < 50) { return; }    // No xp
                userstats.ap -= 4;
                userstats.gold -= 115;
                userstats.army -= 3;

                built.building = type;
                built.health = 4;
                break;
            case 6: // Stone Wall
                if (userstats.ap < 7) { return; }     // No AP
                if (userstats.gold < 180) { return; } // No gold
                if (userstats.army < 5) { return; }   // No army
                if (userstats.xp < 135) { return; }   // No xp
                userstats.ap -= 7;
                userstats.gold -= 180;
                userstats.army -= 5;

                built.building = type;
                built.health = 7;
                break;
        }
    }

    destroy(uid, x, y){
        if (!this.isUserTurn(uid)){ return; }
        let userstats = this.game.usersstats[(this.game.turn) % this.game.usersstats.length];

        let th = 0;
        for (let i = 0, size = this.game.size; i < size; i++){
            for (let j = 0; j < size; j++){
                if (this.map[i][j].owner == uid && this.map[i][j].building == 1){
                    th++;
                }
            }
        }

        let destroyed = this.map[x][y];
        if (destroyed.owner != uid || destroyed.building == 0){ return; }
        if (destroyed.building == 1 && th <= 1){ return; }
        if (userstats.ap < 1){ return; }

        destroyed.building = 0;
        destroyed.health = 0;
        userstats.ap--;
    }

    repair(uid, x, y){
        if (!this.isUserTurn(uid)){ return; }
        let userstats = this.game.usersstats[(this.game.turn) % this.game.usersstats.length];

        let repairing = this.map[x][y];
        if (repairing.owner != uid || repairing.building == 0){ return; }

        let th = 0;
        for (let i = 0, size = this.game.size; i < size; i++){
            for (let j = 0; j < size; j++){
                if (this.map[i][j].owner == uid && this.map[i][j].building == 1){
                    th++;
                }
            }
        }

        switch (repairing.building) {
            case 1: // Town Hall
                if (repairing.health >= 3) { return; }
                if (userstats.ap < 3) { return; }
                if (userstats.army < 2) { return; }
                if (userstats.gold < 210 + 10 * userstats.th) { return; }
                repairing.health++;
                userstats.ap -= 3;
                userstats.army -= 2;
                userstats.gold -= 210 + 10 * userstats.th;
                break;
            case 2: // Mine
                if (repairing.health >= 2) { return; }
                if (userstats.ap < 3) { return; }
                if (userstats.gold < 70) { return; }
                repairing.health++;
                userstats.ap -= 3;
                userstats.gold -= 70;
                break;
            case 3: // Barracks
                if (repairing.health >= 2) { return; }
                if (userstats.ap < 3) { return; }
                if (userstats.gold < 55) { return; }
                repairing.health++;
                userstats.ap -= 3;
                userstats.gold -= 55;
                break;
            case 4:  // Watchtower
                if (repairing.health >= 2) { return; }
                if (userstats.ap < 2) { return; }
                if (userstats.army < 1) { return; }
                if (userstats.gold < 50) { return; }
                repairing.health++;
                userstats.ap -= 2;
                userstats.army--;
                userstats.gold -= 50;
                break;
            case 5: // Wood wall
                if (repairing.health >= 4) { return; }
                if (userstats.ap < 1) { return; }
                if (userstats.army < 1) { return; }
                if (userstats.gold < 30) { return; }
                repairing.health++;
                userstats.ap--;
                userstats.army--;
                userstats.gold -= 30;
                break;
            case 6: // Stone wall
                if (repairing.health >= 7) { return; }
                if (userstats.ap < 1) { return; }
                if (userstats.army < 1) { return; }
                if (userstats.gold < 30) { return; }
                repairing.health++;
                userstats.ap--;
                userstats.army--;
                userstats.gold -= 30;
                break;
        }
    }

    transfer(uid, x, y){
        if (!this.isUserTurn(uid)){ return; }
        let userstats = this.game.usersstats[(this.game.turn) % this.game.usersstats.length];
        if (userstats.gold < 50 || userstats.ap < 1){ return; }

        let friendstats = this.getUserStats(this.map[x][y].owner);
        if (userstats.team > 0 && userstats.team == friendstats.team){
            userstats.gold -= 50;
            userstats.ap --;
            friendstats.gold += 50;
        }

    }
};
module.exports = Game;
