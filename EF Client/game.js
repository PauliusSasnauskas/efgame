const fs = require('fs');
const io = require('socket.io-client');
const {ipcRenderer} = require('electron');
window.$ = window.jQuery = require('./jquery-3.3.1.min.js');

var c = document.getElementById("canvas");
var ctx = null;
const basePath = require('electron').remote.app.getAppPath();

// -------- DRAGGABLE WINDOW -------- //

$("body").on('keydown', (e) => {
    if (e.keyCode == 18) {
        $("#overlay").css({ 'display': 'block' });
        $("#overlay-text").css({ 'display': 'flex' });
    }
}).on('keyup', function (e) {
    if (e.keyCode == 18) {
        $("#overlay").css({ 'display': 'none' });
        $("#overlay-text").css({ 'display': 'none' });
    }
});

// -------- PRELOAD RESOURCES -------- //
let imgsrc = ["bg2", "logo", "bar", "menubuttons", "fire", "buildings", "nature", "flag", "player", "owner", "teams", "eliminated", "spectator", "button", "panel", "log", "bg1", "bg3", "bgcolor", "stats", "mine_off", "actions", "selected", "turn"];
let img = [];
for (let i = 0, n = imgsrc.length; i < n; i++) {
    img[imgsrc[i]] = new Image();
    img[imgsrc[i]].src = "./img/" + imgsrc[i] + ".png";
}

loadUserSettings();

var f = new FontFace('Nokia', 'url("./nokiafc22.ttf")');
f.load().then((font) => {
    document.fonts.add(font);
    exitToMenu();
});

/*var sound_turn = new Audio(sound_path + "turn" + sound_end);//*/

// -------- INGAME VARIABLES -------- //
var selectedi = 0;  // Selected x
var selectedj = 0;  // Selected y
const ts = 12;      // Tile size
const ox = 120;     // Offset x
const oy = 26;      // Offset y
const px = 120;     // Padding x (right)
//const py = 220;     // Padding y (bottom)
var ms;             // Map size
var gx;             // Game size x
var gy;             // Game size y
var _data;          // In game data
var _spectate = 0;  // Is user spectating
const buildings = ["(null)", "Town Hall", "Mine", "Barracks", "Watchtower", "Wood Wall", "Stone Wall"];
var cachedMap = []; // Discovered map area which is always shown afterwards

// -------- MENU VARIABLES -------- //
const usercolors = ["255,255,255", "255,110,0", "255,0,0", "187,0,0", "187,255,0", "0,255,0", "0,192,0", "0,255,141", "0,255,255", "0,148,255", "0,38,255", "0,18,127", "255,250,0", "255,0,151", "255,0,255", "187,0,255"];
const maptypes = ["RMG", "Island", "Empty"];
var userSettings = { name: "New Player", color: 0 };
var socket;
let menuVars = { windowState: 0, ipCached: [], ipText: "", nameText: userSettings.name };
let mapeditVars = { maptype: 0, size: 20 };

// -------- SET CONSTANTS -------- //
const STATE_TITLE = 0;
const STATE_JOIN = 1;
const STATE_SETTINGS = 2;
const STATE_TUTORIAL = 3;
const STATE_MAPEDIT = 4;
const STATE_ABOUT = 5;
const STATE_GAME = 10;

var SWIDTH = 320;
var SHEIGHT = 240;

// -------- MENU SCENES -------- //
const SCENE = {
    0: { // STATE_TITLE
        draw: () => {
            ctx.drawImage(img["bg2"], 0, 0);

            ctx.drawImage(img["logo"], 8, 85);

            let callbacks = [
                () => { showMenu(STATE_JOIN) },
                () => { showMenu(STATE_TUTORIAL) },
                () => { showMenu(STATE_MAPEDIT) },
                () => { loadUserSettings(() => { showMenu(STATE_SETTINGS) }) },
                () => { showMenu(STATE_ABOUT) },
                () => { window.close(); }
            ];

            for (let i = 0; i < 6; i++) {
                drawButton(1, "", 8, 119 + i * 19, 106, callbacks[i]);
                ctx.drawImage(img["menubuttons"], 0, i * 13, 78, 13, 11, 122 + i * 19, 78, 13);
            }
        },
        handleKey: (keyCode, key) => { },
        handleClick: (x, y) => { },
        handleMouseOver: (x, y) => { }
    }, 1: { // STATE_JOIN
        draw: () => {
            ctx.drawImage(img["bg2"], 0, 0);

            drawBar(0, SWIDTH / 2 - 65, 48, 130);
            ctx.fillText("Join Game", SWIDTH / 2, 61);
            showAddressBar();
            ctx.fillStyle = "#ffffff";

            for (let i = 0, n = (menuVars.ipCached.length > 3 ? 3 : menuVars.ipCached.length); i < n; i++) {
                drawButton(1, menuVars.ipCached[i], SWIDTH / 2 - 60, 96 + 18 * i, 120, () => { menuVars.ipText = menuVars.ipCached[i]; connectGame(); });
            }

            drawButton(1, "Connect", SWIDTH / 2 - 65, 152, 130, connectGame);
            drawButton(1, "< Back", 8, SHEIGHT - 26, 70, () => { showMenu(STATE_TITLE); });
            drawButton(1, "Host & Play", 243, 214, 70, () => { showMenu(); ctx.fillText("Coming soon!", 276, 210); }/* loadNewGame */);
        },
        handleKey: (keyCode, key) => {
            if (!isNaN(key) || key == ":" || key == "." || keyCode == 8) {
                //console.log("IP key: " + key);
                if (keyCode == 8 && menuVars.ipText.length > 0) { menuVars.ipText = menuVars.ipText.slice(0, -1); }
                if (keyCode != 8 && menuVars.ipText.length < 21) { menuVars.ipText += key; }
                showAddressBar();
            }
        },
        handleClick: (x, y) => { },
        handleMouseOver: (x, y) => { }
    }, 2: { // STATE_SETTINGS
        draw: () => {
            ctx.drawImage(img["bg2"], 0, 0);

            drawBar(0, SWIDTH / 2 - 130, 82, 128);
            ctx.fillText("Username", SWIDTH / 2 - 66, 95);
            ctx.drawImage(img["bgcolor"], 165, 66);
            drawBar(0, SWIDTH / 2 + 2, 51, 128);
            ctx.fillText("Select color", SWIDTH / 2 + 66, 64);
            drawButton(1, "< Back", 8, SHEIGHT - 26, 64, () => { showMenu(STATE_TITLE); });

            showUsernameBar();

            let offsetx = SWIDTH / 2 + 22;
            let offsety = 81;
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {
                    let color = i * 4 + j;
                    drawMiniButton(6, offsetx + j * 24, offsety + i * 24, () => { changeUserSettings("color", color); });
                    ctx.fillStyle = "rgba(" + usercolors[color] + ",1)";
                    ctx.fillRect(offsetx + 4 + j * 24, offsety + 4 + i * 24, 8, 8);
                }
            }
        },
        handleKey: (keyCode, key) => {
            if ((keyCode >= 65 && keyCode <= 90) || keyCode == 8 || !isNaN(key)) {
                if (keyCode == 8 && menuVars.nameText.length > 0){
                    menuVars.nameText = menuVars.nameText.slice(0, -1);
                }else if (keyCode != 8 && menuVars.nameText.length < 21){
                    menuVars.nameText += key;
                }
                showUsernameBar();
            }
        },
        handleClick: (x, y) => { },
        handleMouseOver: (x, y) => { }
    }, 3: { // STATE_TUTORIAL
        // TODO: tutorial
        draw: () => {
            ctx.drawImage(img["bg2"], 0, 0);

            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.fillText("Coming soon...", SWIDTH / 2, 100);

            drawButton(1, "< Back", 8, SHEIGHT - 26, 64, () => { showMenu(STATE_TITLE); });
        },
        handleKey: (keyCode, key) => { },
        handleClick: (x, y) => { },
        handleMouseOver: (x, y) => { }
    }, 4: { // STATE_MAPEDIT
        draw: () => {
            ctx.drawImage(img["bg2"], 0, 0);


            // TODO: fix
            let posy = 26;
            drawBar(3, 134, posy, 70);
            ctx.textAlign = "center";
            ctx.fillStyle = "#ffffff";
            ctx.fillText("Map size", 169, posy + 12);
            ctx.fillText(_data.size, 169, posy + 30);
            if (_data.size > 10) { drawMiniButton(1, 142, 45, ()=>{ editGameSettings("size", -1); }); }
            if (_data.size < 35) { drawMiniButton(0, 179, 45, ()=>{ editGameSettings("size", 1); }); }

            posy += 50;
            drawBar(3, 134, posy, 70);
            ctx.textAlign = "center";
            ctx.fillStyle = "#ffffff";
            ctx.fillText("Map type", 169, posy + 12);
            ctx.fillText(maptypes[_data.type], 169, posy + 30);
            drawMiniButton(2, 134, posy + 18, ()=>{ editGameSettings("maptype", -1); });
            drawMiniButton(3, 188, posy + 18, ()=>{ editGameSettings("maptype", 1); });

            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";

            drawButton(1, "< Back", 8, SHEIGHT - 26, 64, () => { showMenu(STATE_TITLE); });
        },
        handleKey: (keyCode, key) => { },
        handleClick: (x, y) => { },
        handleMouseOver: (x, y) => { }
    }, 5: { // STATE_ABOUT
        // TODO: about
        draw: () => {
            ctx.drawImage(img["bg3"], 0, 0);

            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.fillText("Coming soon...", SWIDTH / 2, 100);

            drawButton(1, "< Back", 8, SHEIGHT - 26, 64, () => { showMenu(STATE_TITLE); });
        },
        handleKey: (keyCode, key) => { },
        handleClick: (x, y) => { },
        handleMouseOver: (x, y) => { }
    }, 10: { // STATE_GAME
        draw: () => {
            ctx.fillStyle = ctx.createPattern(img["bg1"], "repeat");
            ctx.fillRect(0, 0, c.width, c.height);
        
            drawPlayers();
            drawLog();
            drawStats(_data.state != 2);
            drawTiles();
            drawMenus();
        },
        handleKey: (keyCode, key = null) => {
            switch (keyCode) {
                case 37: // left
                    selectedi--;
                    break;
                case 38: // up
                    selectedj--;
                    break;
                case 39: // right
                    selectedi++;
                    break;
                case 40: // down
                    selectedj++;
                    break;
                case 13: // ENTER
                    interact_chat();
                    break;
                case 27: // ESC
                    exitToMenu();
                    break;
            }
            if (_data.users[(_data.turn) % _data.users.length].id == _data.userstats.id){ // If it is your turn
                switch (keyCode) {
                    case 37: // left
                    case 38: // up
                    case 39: // right
                    case 40: // down
                    case 27: // ESC
                    break;
        
                    case 65: // A
                        interact_attack(selectedi, selectedj);
                    break;
                    case 80: // P
                        interact_leave(selectedi, selectedj);
                    break;
                    case 69: // E
                    case 32: // (Space)
                        interact_endturn();
                    break;
                    case 49: // 1/!
                        interact_build(1, selectedi, selectedj);
                    break;
                    case 50: // 2/@
                        interact_build(2, selectedi, selectedj);
                    break;
                    case 51: // 3/#
                        interact_build(3, selectedi, selectedj);
                    break;
                    case 52: // 4/$
                        interact_build(4, selectedi, selectedj);
                    break;
                    case 53: // 5/%
                        interact_build(5, selectedi, selectedj);
                    break;
                    case 54: // 6/^
                        interact_build(6, selectedi, selectedj);
                    break;
                    case 87: // W
                        interact_destroy(selectedi, selectedj);
                    break;
                    case 82: // R
                        interact_repair(selectedi, selectedj);
                    break;
                    case 72: // H
                        interact_transfer(selectedi, selectedj);
                    break;
                    default:
                        // DEBUG: DISABLE
                        console.log("Key: " + keyCode);
                    break;
                }
            }
            if (selectedi < 0){ selectedi = 0; }
            if (selectedj < 0){ selectedj = 0; }
            if (selectedi > ms-1){ selectedi = ms-1; }
            if (selectedj > ms-1){ selectedj = ms-1; }
            if (_data.state == 0){ return; }
            if (menuVars.windowState != 0){ drawTiles(); }
            if (!_spectate){ drawStats(); }
            selectTile(selectedi*ts, selectedj*ts);
        },
        handleClick: (x, y) => {
            if (_data.state == 0){ return; }
            if (x > ox*2 && x < ox*2+gx*2 && y > oy*2 && y < oy*2 + gy*2){
                drawTiles();
                selectTile(x/2-ox, y/2-oy);
            }
            if (x > ox*2+gx*2+8 && x < ox*2+gx*2+232){
                var top = 242;
                if (y > top && y < top+34){ interact_attack(selectedi, selectedj); }
                if (y > top+38 && y < top+72){ interact_leave(selectedi, selectedj); }
                if (y > top+76 && y < top+110){ interact_endturn(); }

                top = 372;
                if (y > top+0 && y < top+36){ interact_build(1, selectedi, selectedj); }
                if (y > top+38 && y < top+74){ interact_build(2, selectedi, selectedj); }
                if (y > top+76 && y < top+112){ interact_build(3, selectedi, selectedj); }
                if (y > top+114 && y < top+150){ interact_build(4, selectedi, selectedj); }
                if (y > top+152 && y < top+188){ interact_build(5, selectedi, selectedj); }
                if (y > top+190 && y < top+226){ interact_build(6, selectedi, selectedj); }

                top = 614;

                if (y > top && y < top+34){ interact_repair(selectedi, selectedj); }
                if (y > top+38 && y < top+72){ interact_destroy(selectedi, selectedj); }
                if (y > top+76 && y < top+110){ interact_transfer(selectedi, selectedj); }
            }
        },
        handleMouseOver: (x, y) => {
            if (menuVars.windowState != 10) { return; }
            if (_data.state == 1 && _data.users[(_data.turn) % _data.users.length].id == _data.userstats.id) {
                drawStats();
                ctx.textAlign = "end";
                let left = ox*2 + gx*2 + 232;
                if (x > ox*2 + gx*2 + 8 && x < left) {
                    let top = 242;
                    if (y > top && y < top + 34) { // Attack
                        ctx.fillStyle = (_data.userstats.ap >= 2) ? "#007F00" : "#7F0000";
                        ctx.fillText(2, left/2-4, 36);
                        ctx.fillStyle = (_data.userstats.army >= 1) ? "#007F00" : "#7F0000";
                        ctx.fillText(1, left/2-4, 72);
                    }
                    if (y > top + 38 && y < top + 72) {  // Leave
                        ctx.fillStyle = (_data.userstats.ap >= 1) ? "#007F00" : "#7F0000";
                        ctx.fillText(1, left/2-4, 36);
                    }

                    top = 372;
                    if (y > top + 0 && y < top + 36) { // Town Hall
                        ctx.fillStyle = (_data.userstats.ap >= 8) ? "#007F00" : "#7F0000";
                        ctx.fillText(8, left/2-4, 36);
                        ctx.fillStyle = (_data.userstats.gold >= 475 + 25 * _data.userstats.th) ? "#007F00" : "#7F0000";
                        ctx.fillText(475 + 25 * _data.userstats.th, left/2-4, 54);
                        ctx.fillStyle = (_data.userstats.army >= 6) ? "#007F00" : "#7F0000";
                        ctx.fillText(6, left/2-4, 72);
                        if (_data.userstats.xp < 125 + 25 * _data.userstats.th) { ctx.fillStyle = "#7F0000"; ctx.fillText(125 + 25 * _data.userstats.th, left/2-4, 90); }
                    }

                    if (y > top + 38 && y < top + 74) { // Mine
                        ctx.fillStyle = _data.userstats.ap >= 6 ? "#007F00" : "#7F0000";
                        ctx.fillText(6, left/2-4, 36);
                        ctx.fillStyle = (_data.userstatsgold >= 125) ? "#007F00" : "#7F0000";
                        ctx.fillText(125, left/2-4, 54);
                    }

                    if (y > top + 76 && y < top + 112) { // Barracks
                        ctx.fillStyle = _data.userstats.ap >= 6 ? "#007F00" : "#7F0000";
                        ctx.fillText(6, left/2-4, 36);
                        ctx.fillStyle = (_data.userstatsgold >= 100) ? "#007F00" : "#7F0000";
                        ctx.fillText(100, left/2-4, 54);
                    }

                    if (y > top + 114 && y < top + 150) { // Watchtower
                        ctx.fillStyle = _data.userstats.ap >= 4 ? "#007F00" : "#7F0000";
                        ctx.fillText(4, left/2-4, 36);
                        ctx.fillStyle = (_data.userstats.gold >= 90) ? "#007F00" : "#7F0000";
                        ctx.fillText(90, left/2-4, 54);
                        ctx.fillStyle = (_data.userstats.army >= 1) ? "#007F00" : "#7F0000";
                        ctx.fillText(1, left/2-4, 72);
                        if (_data.userstats.xp < 25) { ctx.fillStyle = "#7F0000"; ctx.fillText(25, left/2-4, 90); }
                    }

                    if (y > top + 152 && y < top + 188) { // Wood Wall
                        ctx.fillStyle = _data.userstats.ap >= 4 ? "#007F00" : "#7F0000";
                        ctx.fillText(4, left/2-4, 36);
                        ctx.fillStyle = (_data.userstats.gold >= 115) ? "#007F00" : "#7F0000";
                        ctx.fillText(115, left/2-4, 54);
                        ctx.fillStyle = (_data.userstats.army >= 3) ? "#007F00" : "#7F0000";
                        ctx.fillText(3, left/2-4, 72);
                        if (_data.userstats.xp < 50) { ctx.fillStyle = "#7F0000"; ctx.fillText(50, left/2-4, 90); }
                    }

                    if (y > top + 190 && y < top + 226) { // Stone Wall
                        ctx.fillStyle = (_data.userstats.ap >= 7) ? "#007F00" : "#7F0000";
                        ctx.fillText(7, left/2-4, 36);
                        ctx.fillStyle = (_data.userstats.gold >= 180) ? "#007F00" : "#7F0000";
                        ctx.fillText(180, left/2-4, 54);
                        ctx.fillStyle = (_data.userstats.army >= 5) ? "#007F00" : "#7F0000";
                        ctx.fillText(5, left/2-4, 72);
                        if (_data.userstats.xp < 136) { ctx.fillStyle = "#7F0000"; ctx.fillText(135, left/2-4, 90); }
                    }

                    top = 614;

                    if (y > top && y < top + 34) { // Repair
                        var required = { ap: 0, gold: 0, army: 0 };
                        switch (_data.map[selectedi][selectedj].building) {
                            case 1:
                                required.ap = 3;
                                required.army = 2
                                required.gold = 210 + 10 * _data.userstats.th;
                                break;
                            case 2:
                                required.ap = 2;
                                required.army = 3
                                required.gold = 35;
                                break;
                            case 3:
                                required.ap = 2;
                                required.army = 3
                                required.gold = 50;
                                break;
                            case 4:
                                required.ap = 2;
                                required.army = 1
                                required.gold = 50;
                                break;
                            case 5:
                            case 6:
                                required.ap = 1;
                                required.army = 1
                                required.gold = 30;
                                break;
                        }

                        ctx.fillStyle = (_data.userstats.ap >= required.ap) ? "#007F00" : "#7F0000";
                        ctx.fillText(required.ap, left/2-4, 36);
                        ctx.fillStyle = (_data.userstats.gold >= required.gold) ? "#007F00" : "#7F0000";
                        ctx.fillText(required.gold, left/2-4, 54);
                        ctx.fillStyle = (_data.userstats.army >= required.army) ? "#007F00" : "#7F0000";
                        ctx.fillText(required.army, left/2-4, 72);
                    }
                    if (y > top + 38 && y < top + 72) {  // Demolish
                        ctx.fillStyle = (_data.userstats.ap >= 1) ? "#007F00" : "#7F0000";
                        ctx.fillText(1, left/2-4, 36);
                    }
                    if (y > top + 76 && y < top + 110) { // Transfer
                        ctx.fillStyle = (_data.userstats.ap >= 1) ? "#007F00" : "#7F0000";
                        ctx.fillText(1, left/2-4, 36);
                        ctx.fillStyle = (_data.userstats.gold >= 50) ? "#007F00" : "#7F0000";
                        ctx.fillText(50, left/2-4, 54);
                    }
                }
            }
        }
    }
};

// -------- LOADED CANVAS -------- //
function initialiseCtx() {
    ctx = c.getContext('2d');
    ctx.scale(2, 2);
    ctx.imageSmoothingEnabled = false;
    ctx.font = "8px Nokia";
}

function exitToMenu() {
    if (socket){ socket.disconnect(); }
    if (!c.getContext) {
        c.html("No js/canvas :(");
    } else {
        $("canvas").unbind();

        if (c.width != 640 || c.height != 480){
            ipcRenderer.send('resize', 640, 480);
        }
        c.style.width = 640;
        c.style.height = 480;
        c.width = 640;
        c.height = 480;
        SHEIGHT = 240;
        initialiseCtx();
        showMenu(STATE_TITLE);
    }
}

// -------- MENU FUNCTIONS -------- //
function showMenu(newWindowState = null) {
    if (newWindowState != null) { menuVars.windowState = newWindowState; }
    $(document).unbind('keydown');
    $("canvas").unbind();
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";

    SCENE[menuVars.windowState].draw();

    $("canvas").bind('click', function (event) {
        let rect = c.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        SCENE[menuVars.windowState].handleClick(x, y);
    });

    $("canvas").bind('mousemove', function (e) {
        let rect = c.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        SCENE[menuVars.windowState].handleMouseOver(x, y);
    });

    $(document).keydown(function (e) {
        SCENE[menuVars.windowState].handleKey(e.keyCode, e.key);
    });
}

function showUsernameBar(){
    //ctx.drawImage(img["player"], SWIDTH / 2 - 122, 106);
    drawBox(img["log"], SWIDTH / 2 - 130, 104, 128, 24);

    ctx.fillStyle = "#000000";
    ctx.fillRect(SWIDTH / 2 - 122, 112, 8, 8);
    ctx.fillStyle = "rgba(" + (usercolors[userSettings.color] || "0,0,0") + ",1)";
    ctx.fillRect(SWIDTH / 2 - 121, 113, 6, 6);

    ctx.textAlign = "start";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(menuVars.nameText, SWIDTH / 2 - 109, 120);
    if (menuVars.nameText.length == 0) { ctx.fillStyle = "#aaaaaa"; ctx.fillText("New User", SWIDTH / 2 - 109, 120); }

    if (userSettings.name != menuVars.nameText){ drawButton(2, "Save", 54, 132, 80, () => { changeUserSettings("name", menuVars.nameText) }, false); }
}

function showAddressBar() {
    drawBox(img["log"], SWIDTH / 2 - 65, 70, 130, 23);
    if (menuVars.ipText.length == 0) { ctx.fillStyle = "#aaaaaa"; ctx.fillText("0.0.0.0", SWIDTH / 2, 85); }
    ctx.fillStyle = "#ffffff";
    ctx.fillText(menuVars.ipText, SWIDTH / 2, 85);
}

function loadUserSettings(callback = null) {
    if (!fs.existsSync(basePath + "/user.json")) {
        let defaultsettings = { name: "New User", color: 0 };
        fs.writeFile(basePath + "/user.json", JSON.stringify(defaultsettings), function (err) {
            if (err) throw err;
            //console.log('User settings file created');
        });
    }

    fs.readFile(basePath + "/user.json", function (err, data) {
        if (err) throw err;
        userSettings = JSON.parse(data);
        menuVars.ipCached = Object.assign([], userSettings.cache);
        delete userSettings.cache;
        if (typeof userSettings.name !== "string") { userSettings.name = "New Player"; }
        if (typeof userSettings.color !== "number" || userSettings.color < 0 || userSettings.color > 16) { userSettings.color = 0; }
        menuVars.nameText = userSettings.name;
    });

    if (callback) { callback(); }
}

function changeUserSettings(key, value) {
    switch (key) {
        case "name":
            if (value == null || value.length == 0) {
                value = "New User";
            }
            if (value.length > 20){
                value = value.substring(0, 20);
            }
            break;
        case "color":
            if (typeof value !== "number" || value < 0 || value > 16) {
                value = 0;
            }
            break;
    }
    userSettings[key] = value;
    userSettings.cache = menuVars.ipCached;
    fs.writeFile(basePath + "/user.json", JSON.stringify(userSettings), function (err) {
        if (err) throw err;
        showMenu(STATE_SETTINGS);
        delete userSettings.cache;
    });
}

function drawButton(type, text, x, y, l, callback, unbind = true) {
    drawBar(type, x, y, l);
    ctx.textAlign = "center";
    ctx.fillText(text, x + l / 2 + 1, y + 13);
    $("canvas").bind('click', function (event) {
        var rect = c.getBoundingClientRect();
        var cx = event.clientX - rect.left;
        var cy = event.clientY - rect.top;
        if (cx > x * 2 && cx < x * 2 + l * 2 && cy > y * 2 && cy < y * 2 + 36) {
            if (unbind) { $(this).unbind('click'); }
            callback();
        }
    });
}

function drawMiniButton(type, x, y, callback) {
    ctx.drawImage(img["button"], type * 16, 0, 16, 16, x, y, 16, 16);
    $("canvas").bind('click', function (event) {
        var rect = c.getBoundingClientRect();
        var cx = event.clientX - rect.left;
        var cy = event.clientY - rect.top;
        if (cx > x * 2 && cx < x * 2 + 32 && cy > y * 2 && cy < y * 2 + 32) {
            callback();
        }
    });
}

function connectGame() {
    let parts = menuVars.ipText.split(":");
    let found = parts[0].match(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/);
    if (found == null || found.length == 0) {
        showMenu(STATE_JOIN);
        return;
    }

    let address = found[0] + ":" + (parts[1] == null || parts[1].length == 0 ? "3000" : parts[1]);

    drawBar(0, SWIDTH / 2 - 120, 15, 176);
    ctx.fillText("Connecting to " + address + "...", SWIDTH / 2 - 32, 28);
    drawButton(1, "¤ Cancel", SWIDTH / 2 + 60, 15, 60, () => { socket.disconnect(); showMenu(STATE_JOIN); });

    if (address != menuVars.ipCached[1] && address != menuVars.ipCached[0]){
        if (menuVars.ipCached[1]){ menuVars.ipCached[2] = menuVars.ipCached[1]; }
        if (menuVars.ipCached[0]){ menuVars.ipCached[1] = menuVars.ipCached[0]; }
        menuVars.ipCached[0] = address;

        userSettings.cache = menuVars.ipCached;
        fs.writeFile(basePath + "/user.json", JSON.stringify(userSettings), function (err) {
            if (err) throw err;
            delete userSettings.cache;
        });
    }

    // TODO: something socket
    socket = io.connect("http://" + address);

    socket.on("connect", ()=>{
        socket.emit("usersettings", userSettings);
        ctx.fillText("Connected, transmitting data...", 100, 50);
    });

    socket.on("message", (messageFromServer)=>{
        console.log(messageFromServer);
        //initGame();
    });

    socket.on("meta", (data)=>{
        _data = data;
        console.log(_data);
        initGame();
        if (_data.state == 1){
            ctx.fillText("Game already started, cannot join", SWIDTH/2, SHEIGHT/2);
        }
    });

    socket.on("update", (data)=>{
        //console.log("received update");
        updateThings(data);
        //console.log(data);
    });

    socket.on("disconnect", ()=>{
        exitToMenu();
    });


    /*function clicked(){
        socket.emit('chat', "chatter!");
    }//*/
}

// -------- GAME FUNCTIONS -------- //
function initGame() {

    menuVars.windowState = STATE_GAME;

    // Map size
    ms = _data.size;
    // Game size
    gx = ms * ts;
    gy = ms * ts;

    if (_data.state != 0) {
        let x = (ox + gx + px)*2;
        let y = (oy + gy + 4)*2;
        y = (y < 730 ? 730 : y)

        c.style.width = x;
        c.style.height = y;
        c.width = x;
        c.height = y;
        ipcRenderer.send('resize', x, y);
        initialiseCtx();
    }
    
    updateThings(_data);
}
var added = { ap: 0, gold: 0 };

function updateThings(data) {
    if (_data.state == 0 && data.state == 1) {
        initGame();
        
        $('canvas').unbind();

        let x = (ox + gx + px)*2;
        let y = (oy + gy + 4)*2;
        y = (y < 730 ? 730 : y)

        c.style.width = x;
        c.style.height = y;
        c.width = x;
        c.height = y;
        ipcRenderer.send('resize', x, y);
        initialiseCtx();

        $(document).unbind('keydown');
        $(document).keydown((e) => {
            SCENE[STATE_GAME].handleKey(e.keyCode);
        });

        $("canvas").bind('click', function (event) {
            let rect = c.getBoundingClientRect();
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;
            SCENE[STATE_GAME].handleClick(x, y);
        });

        $("canvas").bind('mousemove', (e) => {
            let rect = c.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;
            SCENE[STATE_GAME].handleMouseOver(x, y);
        });

        for (let i = 0, n = data.size; i < n; i++){
            cachedMap[i] = [];
        }
    }

    if (_data.state == 1 && _data.users != null & _data.users.length > 0){
        if (_data.users[(_data.turn) % _data.users.length].id == _data.userstats.id) {
            if (data.users[(data.turn) % data.users.length].id != data.userstats.id) {
                added.ap = data.userstats.ap - _data.userstats.ap;
                added.gold = data.userstats.gold - _data.userstats.gold;
            }
        } else if (data.users[(data.turn) % data.users.length].id == data.userstats.id && _data.users[(_data.turn) % _data.users.length].id != _data.userstats.id) {
            added.ap = 0;
            added.gold = 0;
            // TODO: sound fix
            //sound_turn.play();
        }
    }
    _data = data;
    if (_data.state == 0) {
        drawLobby();
        cachedMap = [];
    } else {
        SCENE[STATE_GAME].draw();
        updateCachedMap();
    }
    selectTile(selectedi * ts, selectedj * ts);
}

function updateCachedMap(){
    for (let i = 0, n = _data.size; i < n; i++){
        for (let j = 0; j < n; j++){
            let tile = _data.map[i][j];
            if (tile == null || tile.length == 0){ continue; }
            cachedMap[i][j] = tile;
        }
    }
}

function drawLobby() {
    c.width = 640;
    c.height = 760;
    c.style.height = 760;
    c.style.width = 640;
    SHEIGHT = 380;
    initialiseCtx();
    ipcRenderer.send('resize', 640, 760);

    $('canvas').unbind('click');

    ctx.fillStyle = ctx.createPattern(img["bg1"], "repeat");
    ctx.fillRect(0, 0, c.width, c.height);
    drawPlayers();
    drawLog();
    drawMenus();

    drawBar(0, 120, 4, (_data.users[0].id == _data.userstats.id ? 176 : 196));
    ctx.textAlign = "start";
    ctx.fillText(_data.name, 126, 17);

    let posy = 26;
    drawBar(3, 134, posy, 70);
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Map size", 169, posy + 12);
    ctx.fillText(_data.size, 169, posy + 30);

    posy += 51;
    drawBar(3, 134, posy, 70);
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Map type", 169, posy + 12);
    ctx.fillText(maptypes[_data.type], 169, posy + 30);

    posy += 51;
    drawBar(3, 134, posy, 70);
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Teams", 169, posy + 12);
    ctx.fillText(_data.teams, 169, posy + 30);

    if (_data.users[0].id == _data.userstats.id) {
        drawMiniButton(5, 299, 5, ()=>{ editGameSettings("name"); });

        if (_data.size > 10) { drawMiniButton(1, 142, 45, ()=>{ editGameSettings("size", -1); }); }
        if (_data.size < 35) { drawMiniButton(0, 179, 45, ()=>{ editGameSettings("size", 1); }); }

        drawMiniButton(2, 134, 95, ()=>{ editGameSettings("maptype", -1); });
        drawMiniButton(3, 188, 95, ()=>{ editGameSettings("maptype", 1); });

        if (_data.teams > 0) { drawMiniButton(1, 142, 147, ()=>{ editGameSettings("teams", -1); }); }
        if (_data.teams < 4) { drawMiniButton(0, 179, 147, ()=>{ editGameSettings("teams", 1); }); }
    }
}

function editGameSettings(key, value) {
    if (_data.users[0].id != _data.userstats.id) { return; }
    if (key == "size" && value > 0 && _data.size >= 35) { return; }
    if (key == "size" && value < 0 && _data.size <= 10) { return; }
    if (key == "teams" && value > 0 && _data.teams >= 4) { return; }
    if (key == "teams" && value < 0 && _data.teams <= 0) { return; }
    if (key == "name") {
        value = prompt("Enter new game name");
        if (value == null) { return; }
    }

    socket.emit("gamesettings", JSON.stringify({ key: key, value: value }));
}

function getPattern(qimg, sx, sy, w, h, repeat) {
    let oc = document.createElement('canvas');
    oc.width = w;
    oc.height = h;
    let octx = oc.getContext('2d');
    //octx.scale(2,2);
    octx.imageSmoothingEnabled = false;
    octx.drawImage(qimg, sx, sy, w, h, 0, 0, w, h);
    return ctx.createPattern(oc, repeat);
}

function drawBar(type, x, y, l) {
    let qimg = img["bar"];
    ctx.drawImage(qimg, 0, type * 18, 18, 18, x, y, 18, 18);
    ctx.save();
    ctx.translate(x + 18, y);
    ctx.fillStyle = getPattern(qimg, 18, type * 18, 76, 18, "repeat-x");
    ctx.fillRect(0, 0, l - 36, 18);
    ctx.restore();
    ctx.drawImage(qimg, 94, type * 18, 18, 18, x + l - 18, y, 18, 18);
}

function drawBox(qimg, x, y, w, h) {
    ctx.drawImage(qimg, 0, 0, 12, 12, x, y, 12, 12);
    ctx.drawImage(qimg, 12, 0, 12, 12, x + w - 12, y, 12, 12);
    ctx.drawImage(qimg, 0, 12, 12, 12, x, y + h - 12, 12, 12);
    ctx.drawImage(qimg, 12, 12, 12, 12, x + w - 12, y + h - 12, 12, 12);

    ctx.save();
    ctx.fillStyle = getPattern(qimg, 24, 0, 12, 64, "repeat-y");   // left
    ctx.translate(x, y + 12);
    ctx.fillRect(0, 0, 12, h - 24);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = getPattern(qimg, 36, 0, 12, 64, "repeat-y");   // right
    ctx.translate(x + w - 12, y + 12);
    ctx.fillRect(0, 0, 12, h - 24);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = getPattern(qimg, 0, 64, 106, 12, "repeat-x");  // top
    ctx.translate(x + 12, y);
    ctx.fillRect(0, 0, w - 24, 12);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = getPattern(qimg, 0, 76, 106, 12, "repeat-x");  // bottom
    ctx.translate(x + 12, y + h - 12);
    ctx.fillRect(0, 0, w - 24, 12);
    ctx.restore();

    ctx.fillStyle = getPattern(qimg, 48, 0, 64, 64, "repeat");  // middle
    ctx.fillRect(x + 12, y + 12, w - 24, h - 24);
}

function drawLog() {
    drawBox(img["log"], 4, (_data.state == 0 ? c.height / 2 - 74 : oy + gy + 4), (_data.state == 0 ? c.width / 2 - 8 : ox + gx - 4), (_data.state == 0 ? 70 : c.height / 2 - 8 - oy - gy));
    ctx.textAlign = "start";
    ctx.fillStyle = "#ffffff";
    let maxlength = (_data.log.length < 7 ? _data.log.length : 7);
    let offsety = oy + gy + 19;
    if (_data.state == 0) { maxlength = (_data.log.length < 5 ? _data.log.length : 5); offsety = c.height / 2 - 59; }
    for (let i = 0; i < maxlength; i++) {
        let msg = _data.log[_data.log.length - maxlength + i];
        let offsetx = 12;
        // TODO: FIX COLOR (rgba())
        if (msg.color != null) {
            ctx.fillStyle = "#000000";
            ctx.fillRect(offsetx - 2, offsety - 7 + 12 * i, 8, 8);
            ctx.fillStyle = msg.color;
            ctx.fillRect(offsetx, offsety - 6 + 12 * i, 6, 6);
            offsetx += 10;
        }
        ctx.fillStyle = "#ffffff";
        ctx.fillText(msg.text, offsetx, offsety + 12 * i);
    }
}

function drawPlayers() {
    drawBar(0, 4, 4, 112);
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Players", 60, 17);
    ctx.textAlign = "start";

    ctx.fillStyle = ctx.createPattern(img["bg1"], "repeat");
    ctx.fillRect(0, 26, 118, gy+4);

    let posy = 22;
    for (let i = 0, n = _data.users.length; i < n; i++) {
        ctx.drawImage(img["player"], 4, posy);
        ctx.fillStyle = "rgb(" + _data.users[i].color + ")";
        ctx.fillRect(12, posy + 6, 6, 6);
        if (_data.users[i].eliminated) { ctx.drawImage(img["eliminated"], 12, posy + 6); }
        ctx.fillStyle = "#ffffff";
        ctx.fillText(_data.users[i].name, 24, posy + 13);
        ctx.drawImage(img["teams"], _data.users[i].team * 10, 0, 10, 10, 100, posy + 4, 10, 10);
        
        if (_data.state == 1 && _data.map[selectedi][selectedj] != null && _data.map[selectedi][selectedj].owner == _data.users[i].id){ ctx.drawImage(img["selected"], 110, posy+3); }
        if (_data.state == 1 && _data.users[(_data.turn) % _data.users.length].id == _data.users[i].id){ ctx.drawImage(img["turn"], 3, posy+3); }

        posy += 18;
    }
    ctx.drawImage(img["owner"], 88, 27);
    if (_data.spectators != null && _data.spectators != "null" && _data.spectators.length > 0) {
        posy += 10;
        drawBar(0, 4, posy, 112);
        ctx.textAlign = "center";
        ctx.fillText("Spectators", 60, posy + 13);
        ctx.textAlign = "start";
        posy += 18;
        for (let i = 0, n = _data.spectators.length; i < n; i++) {
            ctx.drawImage(img["spectator"], 4, posy);
            ctx.fillText(_data.spectators[i].name, 12, posy + 13);
            posy += 18;
        }
    }
}

function drawStats(drawButtons = true) {
    if (_spectate) { return; }

    var top = 4;

    // Turn
    drawBar(0, ox + gx + 4, 4, 112);
    ctx.textAlign = "start";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Turn: " + _data.showturn, ox + gx + 10, 17);

    top += 19;
    // Stats
    for (let i = 0; i < 5; i++) {
        ctx.drawImage(img["bar"], 0, 18, 112, 18, ox + gx + 4, 18 * i + top, 112, 18);
        ctx.drawImage(img["stats"], 0 + 12 * i, 0, 12, 12, ox + gx + 7, 18 * i + top + 3, 12, 12);
    }
    top += 13;
    ctx.fillText(_data.userstats.ap + " / " + (12 + Math.floor(_data.userstats.xp / 8)), ox + gx + 26, top);
    ctx.fillText(_data.userstats.gold, ox + gx + 26, top + 18);
    ctx.fillText(_data.userstats.army, ox + gx + 26, top + 36);
    ctx.fillText(Math.floor(_data.userstats.xp), ox + gx + 26, top + 54);
    ctx.fillText(_data.userstats.land/* + " / " + ms*ms*/, ox + gx + 26, top + 72);

    if (added.ap > 0 || added.gold > 0) {
        ctx.textAlign = "end";
        ctx.fillStyle = "#aaaaaa";
        ctx.fillText("+" + added.ap, ox + gx + 112, 36);
        ctx.fillText("+" + added.gold, ox + gx + 112, 54);
    }

    if (drawButtons){

        let top = 121;
        // Actions Territory/Turn
        for (let i = 0; i < 3; i++) {
            ctx.drawImage(img["bar"], 0, 18, 112, 18, ox + gx + 4, top, 112, 18);
            ctx.drawImage(img["actions"], 0, i * 13, 112, 13, ox + gx + 6, top + 3, 112, 13);
            top += 19;
        }
        top += 8;

        // Buildings
        ctx.textAlign = "start";
        for (let i = 1; i < 7; i++) {
            ctx.drawImage(img["bar"], 0, 18, 112, 18, ox + gx + 4, top, 112, 18);
            ctx.drawImage(img["buildings"], 12 * i, 0, 12, 12, ox + gx + 7, top + 3, 12, 12);
            ctx.fillText("(" + i + ") " + buildings[i], ox + gx + 22, top + 13);
            top += 19;
        }
        top += 8;

        // Actions Building/Team
        for (let i = 3; i < 6; i++) {
            ctx.drawImage(img["bar"], 0, 18, 112, 18, ox + gx + 4, top, 112, 18);
            ctx.drawImage(img["actions"], 0, i * 13, 112, 13, ox + gx + 6, top + 3, 112, 13);
            top += 18;
        }
    }
}

function drawTiles() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(ox - 1, oy - 1, gx + 2, gy + 2);

    drawBar(0, ox - 1, 4, gx + 2);

    ctx.fillStyle = "#485D44";
    ctx.fillRect(ox, oy, gx, gy);

    for (let i = 0; i < ms; i++) {
        for (let j = 0; j < ms; j++) {
            drawTile(i, j);
        }
    }

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    if (_data.state == 1){
        ctx.fillText("It is " + _data.users[(_data.turn) % _data.users.length].name + "'s turn!", ox+gx/2, oy-9);
    }else if (_data.state == 2){
        ctx.fillText("Game over!", ox+gx/2, oy-9);
    }
}

function drawMenus() {
    if (_data.state == 0){
        drawButton(1, "Disconnect", 134, 179, 70, ()=>{ socket.disconnect(); exitToMenu(); });
        if (_data.teams > 0){
            var teamnames = ["Neutral", "Team 1", "Team 2", "Team 3", "Team 4"];
            for (let i = 0, n = _data.teams; i <= n; i++) {
                drawButton(1, "Join " + teamnames[i], SWIDTH - 94, 23 + 18 * i, 90, () => { joinTeam(i); }, false);
                ctx.drawImage(img["teams"], i * 10, 0, 10, 10, SWIDTH - 90, 27 + 18 * i, 10, 10);
            }
        }
        if (/* _data.users != null && _data.users.length > 0 &&  */_data.users[0].id == _data.userstats.id){
            drawBox(img["panel"], SWIDTH - 100, SHEIGHT - 136, 96, 59);
            ctx.drawImage(img["panel"], 0, 23, 26, 13, SWIDTH - 64, SHEIGHT - 136, 26, 13);
            ctx.fillStyle = "#ffffff";
            drawButton(2, "Start Game!", SWIDTH - 92, SHEIGHT - 124, 80, startGame);
        }
    }else if (_data.state == 2){
        ctx.fillStyle = "#ffffff";
        drawButton(1, "Go to Lobby", ox + gx + 4, 121, 112, ()=>{}, false);

        if (/* _data.users != null && _data.users.length > 0 &&  */_data.users[0].id == _data.userstats.id){
            //drawBox(img["panel"], ox + gx / 2 - 64, oy + 32, 128, 128);
            drawBox(img["panel"], ox + gx + 4, 121, 112, 68);
            ctx.drawImage(img["panel"], 0, 23, 26, 13, ox + gx + 55, 121, 26, 13);
            //ctx.drawImage(img["panel"], 0, 23, 26, 13, ox + gx + 4 - 13, oy + 32, 26, 13);
        }
    }
}

function drawTile(x, y) {
    let tile = _data.map[x][y];
    let old = false;

    if (tile == null || tile.length == 0) {
        tile = (cachedMap[x] ? (cachedMap[x][y] ? cachedMap[x][y] : null) : null);
        if (tile == null || tile.length == 0){
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(ox + x * ts, oy + y * ts, ts, ts);
            return;
        }else{
            old = true;
        }
    }

    var sx = ox + tile.x * ts;
    var sy = oy + tile.y * ts;

    if (tile.owner != 0 && !old) {
        for (let i = 0, n = _data.users.length; i < n; i++) {
            if (_data.users[i].id == tile.owner) {
                ctx.fillStyle = "rgba(" + _data.users[i].color + ",0.4)";
                ctx.fillRect(sx, sy, ts, ts);
                ctx.fillStyle = "rgba(" + _data.users[i].color + ",0.7)";
                break;
            }
        }
    }

    if (tile.building > 0) {
        if (tile.building == 2 && tile.nature == 0) {
            ctx.drawImage(img["mine_off"], sx, sy);
        } else {
            ctx.drawImage(img["buildings"], 12 * tile.building, 0, 12, 12, sx, sy, 12, 12);
        }
        switch (tile.building) {
            case 1: if (tile.health < 3) { ctx.drawImage(img["fire"], 12 * (3 - tile.health), 0, 12, 12, sx, sy, 12, 12); } break;
            case 2:
            case 3:
            case 4: if (tile.health < 2) { ctx.drawImage(img["fire"], 12 * (2 - tile.health), 0, 12, 12, sx, sy, 12, 12); } break;
            case 5: if (tile.health < 4) { ctx.drawImage(img["fire"], 12 * (4 - tile.health), 0, 12, 12, sx, sy, 12, 12); } ctx.drawImage(img["flag"], sx + 5, sy - 1); ctx.fillRect(sx + 6, sy, 5, 3); break;
            case 6: if (tile.health < 7) { ctx.drawImage(img["fire"], 12 * (7 - tile.health), 0, 12, 12, sx, sy, 12, 12); } ctx.drawImage(img["flag"], sx + 5, sy - 1); ctx.fillRect(sx + 6, sy, 5, 3); break;
        }
    }

    if (tile.building == 0 && tile.nature > 0) {
        ctx.drawImage(img["nature"], 12 * tile.nature, 0, 12, 12, sx, sy, 12, 12);
    }

    if (old){
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillRect(ox + x * ts, oy + y * ts, ts, ts);
    }
}

function selectTile(x, y) {
    if (_data.state == 0) { return; }
    var sx = ox + ts * Math.floor(x / ts);
    var sy = oy + ts * Math.floor(y / ts);

    selectedi = Math.floor(x / ts);
    selectedj = Math.floor(y / ts);

    ctx.fillStyle = "#ffffff";
    drawBar(0, ox + gx + 4, 4, 112);
    ctx.textAlign = "start";
    ctx.fillText("Turn: " + _data.showturn, ox + gx + 10, 17);
    ctx.textAlign = "end";
    ctx.fillText(Math.floor(x / ts) + "x" + Math.floor(y / ts), ox + gx + px - 8, 17);
    ctx.textAlign = "start";

    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 0.5;
    ctx.strokeRect(sx, sy, ts, ts);
    
    if (_data.map[selectedi][selectedj] != null && _data.map[selectedi][selectedj].building > 0) {
        let health = 0;
        switch (_data.map[selectedi][selectedj].building) {
            case 1: health = _data.map[selectedi][selectedj].health / 3; break;
            case 2:
            case 3:
            case 4: health = _data.map[selectedi][selectedj].health / 2; break;
            case 5: health = _data.map[selectedi][selectedj].health / 4; break;
            case 6: health = _data.map[selectedi][selectedj].health / 7; break;
        }
        ctx.fillStyle = "rgba(0,255,0,0.5)";
        ctx.fillRect(sx - 1, sy + ts + 1, health * (ts + 2), 3);
        ctx.fillStyle = "rgba(255,0,0,0.5)";
        ctx.fillRect(sx - 1 + health * (ts + 2), sy + ts + 1, (1 - health) * (ts + 2), 3);
        ctx.strokeRect(sx - 1, sy + ts + 1, ts + 2, 3);
    }
    //drawMenus();
    drawPlayers();
}

function startGame() {
    socket.emit("startgame");
}

function joinTeam(number) {
    if (number > _data.teams) { return; }
    if (_data.state > 0) { return; }
    socket.emit("team", number);
}

function interact_chat() {
    //let msg = prompt("Enter your message");
    //if (msg == null) { return; }
    // TODO: make message system
    // socket.emit("msg", msg);
}

function interact_endturn() {
    if (_data.state != 1) { return; }
    socket.emit("endturn");
}

function interact_attack(x, y) {
    if (_data.map[x][y] == null){ return; }
    if (_data.state != 1) { return; }
    if (_data.map[x][y].nature > 1 || _data.map[x][y].owner == _data.userstats.id) { return; }                  // Obstruction
    if (_data.teams > 0 && _data.userstats.team > 0 && _data.map[x][y].team == _data.userstats.team) { return; } // Teammate
    if (_data.userstats.ap < 2 || _data.userstats.army < 1) { return; }                                    // No resources
    if (!checkBound(x, y)) { return; }                                                                               // No two bounding tiles
    _data.userstats.ap -= 2;
    _data.userstats.army--;
    if (_data.map[x][y].owner != 0 && _data.map[x][y].building > 0) {
        _data.map[x][y].health--;
        if (_data.map[x][y].health <= 0) {
            _data.map[x][y].building = 0;
            _data.map[x][y].owner = _data.userstats.id;
        }
    } else {
        _data.map[x][y].owner = _data.userstats.id;
    }

    socket.emit("attack", {x: x, y: y});
}

function interact_leave(x, y) {
    if (_data.state != 1) { return; }
    if (_data.map[x][y].nature > 1 || _data.map[x][y].owner != _data.userstats.id) { return; }                  // Obstruction
    if (_data.userstats.ap < 1) { return; }                                                                     // No resources
    _data.userstats.ap--;
    _data.map[x][y].owner = 0;

    socket.emit("leave", {x: x, y: y});
}

function checkBound(x, y) {
    let good_friend = 0;
    let friend = 0;
    if (x - 1 >= 0) {
        if (y - 1 >= 0 && _data.map[x - 1][y - 1] != null) { friend += (_data.map[x - 1][y - 1].owner == _data.userstats.id ? 1 : 0); }
        if (y + 1 < ms && _data.map[x - 1][y + 1] != null) { friend += (_data.map[x - 1][y + 1].owner == _data.userstats.id ? 1 : 0); }
        if (_data.map[x - 1][y] != null && _data.map[x - 1][y].building == 1 && _data.map[x - 1][y].owner == _data.userstats.id) { return true; }
        good_friend += (_data.map[x - 1][y] != null && _data.map[x - 1][y].owner == _data.userstats.id ? 1 : 0);
    }

    if (y - 1 >= 0 && _data.map[x][y - 1] != null) { good_friend += (_data.map[x][y - 1].owner == _data.userstats.id ? 1 : 0); }
    if (y + 1 < ms && _data.map[x][y + 1] != null) { good_friend += (_data.map[x][y + 1].owner == _data.userstats.id ? 1 : 0); }
    if (y - 1 >= 0 && _data.map[x][y - 1] != null && _data.map[x][y - 1].building == 1 && _data.map[x][y - 1].owner == _data.userstats.id) { return true; }
    if (y + 1 < ms && _data.map[x][y + 1] != null && _data.map[x][y + 1].building == 1 && _data.map[x][y + 1].owner == _data.userstats.id) { return true; }

    if (x + 1 < ms) {
        if (y - 1 >= 0 && _data.map[x + 1][y - 1] != null) { friend += (_data.map[x + 1][y - 1].owner == _data.userstats.id ? 1 : 0); }
        if (y + 1 < ms && _data.map[x + 1][y + 1] != null) { friend += (_data.map[x + 1][y + 1].owner == _data.userstats.id ? 1 : 0); }
        good_friend += (_data.map[x + 1][y] != null && _data.map[x + 1][y].owner == _data.userstats.id ? 1 : 0);
        if (_data.map[x + 1][y] != null && _data.map[x + 1][y].building == 1 && _data.map[x + 1][y].owner == _data.userstats.id) { return true; }
    }

    if (good_friend >= 1 && friend >= 1) { return true; }
    if (good_friend >= 2) { return true; }
    return false;
}

function interact_build(type, x, y) {
    if (_data.state != 1) { return; }
    if (_data.map[x][y].owner != _data.userstats.id || _data.map[x][y].building != 0) { return; }               // Not your tile / not empty tile
    switch (type) {
        case 1: // Town hall
            if (_data.userstats.ap < 8) { return; }     // No AP
            if (_data.userstats.gold < 500) { return; }  // No gold
            if (_data.userstats.army < 6) { return; }   // No army
            if (_data.userstats.xp < 150) { return; }    // No xp
            break;
        case 2: // Mine
            if (_data.userstats.ap < 6) { return; }     // No AP
            if (_data.userstats.gold < 125) { return; } // No gold
            _data.userstats.ap -= 6;
            _data.userstats.gold -= 125;

            _data.map[x][y].building = type;
            _data.map[x][y].health = 2;
            break;
        case 3: // Barracks
            if (_data.userstats.ap < 6) { return; }     // No AP
            if (_data.userstats.gold < 100) { return; } // No gold
            _data.userstats.ap -= 6;
            _data.userstats.gold -= 100;

            _data.map[x][y].building = type;
            _data.map[x][y].health = 2;
            break;
        case 4: // Watchtower
            if (_data.userstats.ap < 4) { return; }     // No AP
            if (_data.userstats.gold < 90) { return; }  // No gold
            if (_data.userstats.army < 1) { return; }   // No army
            if (_data.userstats.xp < 25) { return; }    // No xp
            _data.userstats.ap -= 4;
            _data.userstats.gold -= 90;
            _data.userstats.army -= 1;

            _data.map[x][y].building = type;
            _data.map[x][y].health = 2;
            break;
        case 5: // Wood Wall
            if (_data.userstats.ap < 4) { return; }     // No AP
            if (_data.userstats.gold < 115) { return; } // No gold
            if (_data.userstats.army < 3) { return; }   // No army
            if (_data.userstats.xp < 50) { return; }    // No xp
            _data.userstats.ap -= 4;
            _data.userstats.gold -= 115;
            _data.userstats.army -= 3;

            _data.map[x][y].building = type;
            _data.map[x][y].health = 4;
            break;
        case 6: // Stone Wall
            if (_data.userstats.ap < 7) { return; }     // No AP
            if (_data.userstats.gold < 180) { return; } // No gold
            if (_data.userstats.army < 5) { return; }   // No army
            if (_data.userstats.xp < 135) { return; }   // No xp
            _data.userstats.ap -= 7;
            _data.userstats.gold -= 180;
            _data.userstats.army -= 5;

            _data.map[x][y].building = type;
            _data.map[x][y].health = 7;
            break;
    }

    socket.emit("build", {x: x, y: y, type: type});
}

function interact_destroy(x, y) {
    if (_data.state != 1) { return; }
    if (_data.map[x][y].owner != _data.userstats.id || _data.map[x][y].building == 0) { return; }   // Not your tile / no building
    if (_data.userstats.ap < 1) { return; }                                                         // No AP

    if (_data.map[x][y].building == 1 && _data.userstats.th == 1) { return; }                       // Last Town Hall
    _data.userstats.ap--;
    _data.map[x][y].building = 0;
    _data.map[x][y].health = 0;

    socket.emit("destroy", {x: x, y: y});
}

function interact_repair(x, y) {
    if (_data.state != 1) { return; }
    if (_data.map[x][y].owner != _data.userstats.id || _data.map[x][y].building == 0) { return; }   // Not your tile / no building


    switch (_data.map[x][y].building) {
        case 1: // Town Hall
            if (_data.map[x][y].health >= 3) { return; }
            if (_data.userstats.ap < 3) { return; }
            if (_data.userstats.army < 2) { return; }
            if (_data.userstats.gold < 210 + 10 * _data.userstats.th) { return; }
            _data.map[x][y].health++;
            _data.userstats.ap -= 3;
            _data.userstats.army -= 2;
            _data.userstats.gold -= 210 + 10 * _data.userstats.th;
            break;
        case 2: // Mine
            if (_data.map[x][y].health >= 2) { return; }
            if (_data.userstats.ap < 3) { return; }
            if (_data.userstats.gold < 70) { return; }
            _data.map[x][y].health++;
            _data.userstats.ap -= 3;
            _data.userstats.gold -= 70;
            break;
        case 3: // Barracks
            if (_data.map[x][y].health >= 2) { return; }
            if (_data.userstats.ap < 3) { return; }
            if (_data.userstats.gold < 55) { return; }
            _data.map[x][y].health++;
            _data.userstats.ap -= 3;
            _data.userstats.gold -= 55;
            break;
        case 4:  // Watchtower
            if (_data.map[x][y].health >= 2) { return; }
            if (_data.userstats.ap < 2) { return; }
            if (_data.userstats.army < 1) { return; }
            if (_data.userstats.gold < 50) { return; }
            _data.map[x][y].health++;
            _data.userstats.ap -= 2;
            _data.userstats.army--;
            _data.userstats.gold -= 50;
            break;
        case 5: // Wood wall
            if (_data.map[x][y].health >= 4) { return; }
            if (_data.userstats.ap < 1) { return; }
            if (_data.userstats.army < 1) { return; }
            if (_data.userstats.gold < 30) { return; }
            _data.map[x][y].health++;
            _data.userstats.ap--;
            _data.userstats.army--;
            _data.userstats.gold -= 30;
            break;
        case 6: // Stone wall
            if (_data.map[x][y].health >= 7) { return; }
            if (_data.userstats.ap < 1) { return; }
            if (_data.userstats.army < 1) { return; }
            if (_data.userstats.gold < 30) { return; }
            _data.map[x][y].health++;
            _data.userstats.ap--;
            _data.userstats.army--;
            _data.userstats.gold -= 30;
            break;
    }

    socket.emit("repair", {x: x, y: y});
}

function interact_transfer(x, y){
    if (_data.state != 1) { return; }
    if (_data.map[x][y].team != _data.userstats.team) { return; }   // Not your friend
    if (_data.userstats.gold < 50 || _data.userstats.ap < 1){ return; } // No resources

    socket.emit("transfer", {x: x, y: y});
}

// -------- MAP EDITOR FUNCTIONS -------- //

function save(filename, data) {
    let blob = new Blob([data], { type: 'text/csv' });
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    } else {
        let elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        window.URL.revokeObjectURL(elem.href);
        document.body.removeChild(elem);
    }
}