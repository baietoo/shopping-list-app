const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

//  Listen for app to be ready
app.on('ready', function(){
    // create new window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    // load htm file in window
    mainWindow.loadURL(url.format({
        pathname:path.join(__dirname, 'mainWindow.html'),
        protocol:'file:',
        slashes: true
    }));
    // quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    });
    // build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
});

// handle create add window
function createAddWindow(){
    // create new window
    addWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        width:300,
        height:200,
        Title:'Add shopping list item'
    });
    // load htm file in window
    addWindow.loadURL(url.format({
        pathname:path.join(__dirname, 'addWindow.html'),
        protocol:'file:',
        slashes: true
    }));
    // garbage collection handle
    addWindow.on('close', function(){
        addWindow = null;
    } );
}

// catch item:add
ipcMain.on('item:add',function(e, item){
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});
// create menu template
const mainMenuTemplate = [
    {
        label:'File',
        submenu:[
            {
                label:'add item',
                click(){
                    createAddWindow();
                }
            },
            {
                label:'clear items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label:'quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

// if macOs, add emmpty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// Add developer tools item if not in production
if (process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}