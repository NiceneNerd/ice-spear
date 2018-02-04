/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const uuid = require("uuid/v4");
const path = require('path');
const url  = require('url');

const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;

/**
 * Handler class for electron-windows
 * it can open windows, and handle their events including closing them
 */
module.exports = class Window_Handler
{
    constructor()
    {
        this.APP_PATH       = "apps";
        this.APP_INDEX_FILE = "app.html";

        this.windows = {};
        this.packageJson = require("./../package.json");

        this._initIPC();
    }

    /**
     * inits IPC communication to open windows from within windows
     */
    _initIPC()
    {
        ipc.on('open-app', (e, name, params) =>
        {
            this.open(name, params);
        });
    }

    /**
     * returns the number of opened windows
     */
    countWindows()
    {
        let res = 0;
        for(let windows of this.windows)
        {
            ++res;
        }
        return res;
    }

    /**
     * opens a new window/app
     * @param {String} name name of the app
     * @param {Object|NULL} params optional params
     * @return {String} generated and unique window id
     */
    open(name, params = {})
    {
        let windowSize = this.packageJson["ice-spear"]["default-size"];

        let window = new BrowserWindow({
            width : windowSize[0],
            height: windowSize[1],
            icon: this.packageJson["ice-spear"]["app-icon"],
            //frame: false,
        });

        window.loadURL(url.format({
            pathname: path.join(__dirname, "..", this.APP_PATH, name, this.APP_INDEX_FILE),
            protocol: 'file:',
            slashes : true
        }));

        if(this.packageJson["ice-spear"]["debug-mode"])
            window.webContents.openDevTools();

        window.on('closed', (event) =>
        {
            let resId = event.sender.resId;
            delete this.windows[resId];
        });

        window.resId = uuid();
        window.windowHandler = this;
        window.name  = name;

        this.windows[window.resId] = window;
    }

    /**
     * Handler for the app.on('browser-window-created') event
     * @param {Event} e 
     * @param {BrowserWindow} window 
     */
    onWindowCreated(e, window)
    {
        if(!this.packageJson["ice-spear"]["debug-mode"])
            window.setMenu(null);
    }
};

/*
    tray = new Tray("./assets/icons/icon_64.png")
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Item1', type: 'radio'},
    {label: 'Item2', type: 'radio'},
    {label: 'Item3', type: 'radio', checked: true},
    {label: 'Item4', type: 'radio'}
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)
   */