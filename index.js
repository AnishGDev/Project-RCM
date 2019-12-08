const electron = require('electron')
const {app , BrowserWindow} = electron
const fs = require('fs')
let path = require('path')
var appReady = false
console.log("OUTSIDE")
let win = null; 
let splashScreen = null;
console.log("Made it past requiring the zeroRPC")
function createWindow() {
    win = new BrowserWindow({width: 1200, height: 720, show:false});
    //win.loadFile('index.html')
    //win.webContents.openDevTools();
   // while (true) {
     //   console.log(electron.screen.getCursorScreenPoint())
    //}
    splashScreen = new BrowserWindow({width: 500, height: 500, transparent: true, frame: false, alwaysOnTop: true});
    splashScreen.loadFile("splashScreen.html")
    win.loadFile("index.html")
    win.once('ready-to-show', () => {
        console.log("YEEEEET")
        splashScreen.webContents.send('kill')
        setTimeout(destroySplash, 1500); 
        console.log("Now Loading")
      });
    win.on('closed', () => {
        win = null;
    })
    var testPath = path.join(__dirname, 'py', 'testing_spawn.py')
    var python = require('child_process').spawn('python', [testPath]);
    python.stdout.on('data',function(data){
        console.log("data: ",data.toString('utf8'));
    });
}
app.on('ready', createWindow);
function destroySplash() {
    splashScreen.destroy();
    win.show();
    win.webContents.openDevTools();
    console.log(app.getAppPath())
}


global.infoVault = {width: null, height: null, ip: null, win, splashScreen, legoOrNot: true};

app.on('window-all-closed', () => {
        app.quit();
})

if (appReady) {
    console.log(electron.screen.getCursorScreenPoint())
    
} else{
    console.log("App is not ready yet")
}

let pyProc = null;
let pyPort = null;
const selectPort = () => {
    pyPort = 9999
    return pyPort
}
console.log(__dirname)


const createProcess = () => {
    let port = '' + selectPort();
    let pyScript = path.join(__dirname, "py", "robo_server_auto.py");
    console.log(pyScript)
    console.log(fs.existsSync(pyScript))
    pyProcess = require('child_process').spawn('python3',[pyScript, port])
    if (pyProcess!= null) {
        console.log('The process was successfully launched!');
    }
}

const killProcess = () => {
    pyProcess.kill()
    pyProcess = null;
    pyPort = null;
}

app.on('ready', createProcess)
app.on('will-quit', killProcess)

electron.ipcMain.on('ondragstart', (event, filePath) => {
    event.sender.startDrag({
      file: filePath,
      icon: '/path/to/icon.png'
    })
  })
