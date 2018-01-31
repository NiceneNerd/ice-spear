/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Theme_Manager = requireGlobal('./lib/theme_manager.js');
const Loader = requireGlobal("./lib/loader.js");

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

        this.loader = new Loader(
            this.node.querySelector(".window"),
            this.node.querySelector("#loader-container")
        );
    }

    clear()
    {
    }

    /**
     * opens a new Window with the credits
     * the file can be found in /credits.html
     */
    openCredits()
    {
        if(this.creditWindow == null)
        {
            this.creditWindow = new BrowserWindow({
                //frame: false,
                //resizable: false,
                width: 880,
                height: 935,
                icon: "assets/icons/icon_64.png"
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

    /**
     * changes the Theme of the whole application
     * @param {Node} node current theme button pressed
     * @param {String} theme name of the theme
     */
    setTheme(node, theme)
    {
        let themeButtons = this.node.querySelectorAll(".btn-theme");
        for(let btn of themeButtons)
            btn.classList.remove("active");

        node.classList.add("active");
        this.themeManager.setTheme(theme);
    }

    /**
     * called to start the app
     */
    run()
    {
    }

    /**
     * enables or disables fullscreen
     * @param {Bool} newState 
     */
    toggleFullscreen(newState = null)
    {
        if(newState === null)
            newState = !this.window.isFullScreen();

        this.window.setFullScreen(newState);
    }

    /**
     * called when the user is trying to exit the app
     */
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
