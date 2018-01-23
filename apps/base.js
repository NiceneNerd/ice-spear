/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Theme_Manager = requireGlobal('./lib/theme_manager.js');

const electron = require('electron');
const path     = require('path');
const url      = require('url');

const {dialog} = electron.remote;
const BrowserWindow = electron.remote.BrowserWindow;

module.exports = class App_Base
{
    constructor(window, args)
    {
        if(window == null)
            throw "App: electron window is NULL!";

        this.node         = document;
        this.window       = window;
        this.args         = args;
        this.filePath     = "";
        this.themeManager = new Theme_Manager(this.node, "dark");
        this.creditWindow = null;
    }

    clear()
    {
    }

    openCredits()
    {
        if(this.creditWindow == null)
        {
            this.creditWindow = new BrowserWindow({
                //frame: false,
                //resizable: false,
                width: 880,
                height: 935,
                icon: "file:///assets/icons/icon_64.png"
            });

            this.creditWindow.name = "main-window-credits";

            // and load the index.html of the app.
            this.creditWindow.loadURL(url.format({
                pathname: path.join(__BASE_PATH, 'credits.html'),
                protocol: 'file:',
                slashes: true
            }));

            this.creditWindow.on('closed', () => this.creditWindow = null);
            this.creditWindow.setMenu(null);
        }
    }

    setTheme(node, theme)
    {
        let themeButtons = this.node.querySelectorAll(".btn-theme");
        for(let btn of themeButtons)
            btn.classList.remove("active");

        node.classList.add("active");
        this.themeManager.setTheme(theme);
    }

    run()
    {
    }

    toggleFullscreen(newState = null)
    {
        if(newState === null)
            newState = !this.window.isFullScreen();

        this.window.setFullScreen(newState);
    }

    exit()
    {
        let answer = dialog.showMessageBox({
            type: "question",
            title: "Exit Editor",
            message: "Do you really want to exit?",
            buttons: ["OK", "Cancel"]
        });

        if(answer == 0) // Cancel
        {
            electron.remote.app.exit();
        }
    }
};
