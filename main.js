/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const electron = require('electron');
const path     = require('path');
const url      = require('url');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const DEFAULT_APP_NAME = "bfres_editor";

var appWindow = {};

function openApp(appName = DEFAULT_APP_NAME)
{
    // Create the browser window.
    appWindow[appName] = new BrowserWindow({
        //frame: false,
        width: 1024,
        height: 768,
        icon: "file:///assets/icons/icon_64.png"
    });

    appWindow[appName].name = "window-" + appName;

    appWindow[appName].loadURL(url.format({
        pathname: path.join(__dirname, `apps/${appName}/app.html`),
        protocol: 'file:',
        slashes: true
    }));

    appWindow[appName].webContents.openDevTools();

    appWindow[appName].on('closed', function()
    {
        mainWindow = null;
    });
}

app.on('ready', function()
{
    let appName = (process.argv[2] != null) ? process.argv[2] : DEFAULT_APP_NAME;

    openApp(appName);
});

app.on('window-all-closed', function()
{
    if(process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function()
{
  // On OS X it's common to re-create a window in the app when the, dock icon is clicked and there are no other windows open.
    //if(mainWindow === null)
    //    openApp();
});

app.on('browser-window-created',function(e, window)
{
    //window.setMenu(null);
});
