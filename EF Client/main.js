const electron = require('electron');
const {ipcMain, app, BrowserWindow} = require('electron');

let mainWindow;

var nativeZoom;

function createWindow () {
    nativeZoom = electron.screen.getPrimaryDisplay().scaleFactor;

    mainWindow = new BrowserWindow({
        frame: false,
        titleBarStyle: 'hidden',
        width: 640/nativeZoom,
        height: 480/nativeZoom,
        useContentSize: true,
        resizable: false, // DEBUG!
        skipTaskbar: false,
        title: "EFGAME",
        autoHideMenuBar: true,
        webPreferences: {
            zoomFactor: 1/nativeZoom
        }
    });
    mainWindow.loadFile('index.html');
    mainWindow.webContents.openDevTools(); // Open the DevTools. DEBUG!
    mainWindow.on('closed', ()=>{
        // TODO: close active sockets?
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', ()=>{
    if (process.platform !== 'darwin') { // minimize to dock (OSX)
        app.quit();
    }
});

app.on('activate', ()=>{ // Restart from dock (OSX)
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on("resize", (e, x, y)=>{
    if (typeof(x) != "number" || typeof(y) != "number"){
        console.log("not numbers: " + x + ", " + y);
        return;
    }
    let xdiff = mainWindow.getSize()[0] - x/nativeZoom;
    let ydiff = mainWindow.getSize()[1] - y/nativeZoom;
    
    mainWindow.setPosition(Math.round(mainWindow.getPosition()[0] + xdiff/2), Math.round(mainWindow.getPosition()[1] + ydiff/2));
    mainWindow.setSize(Math.floor(x/nativeZoom), Math.floor(y/nativeZoom));
    
});
