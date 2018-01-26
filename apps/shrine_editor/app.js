/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Tab_Manager        = requireGlobal('./lib/tab_manager.js');
const Theme_Manager      = requireGlobal('./lib/theme_manager.js');

const electron = require('electron');
const fs       = require('fs');
const path     = require('path');
const url      = require('url');
const Split    = require('split.js');

const {dialog} = electron.remote;
const BrowserWindow = electron.remote.BrowserWindow;

const App_Base = requireGlobal("./apps/base.js");

module.exports = class App extends App_Base
{
    constructor(window, args)
    {
        super(window, args);

        this.footerNode = footer.querySelector(".data-footer");

        Split(['#main-sidebar-left', '#main-sidebar-right'], {
            sizes     : [50, 50],
            minSize   : 0,
            snapOffset: 60,
            gutterSize: 12
        });

        this.clear();
    }

    clear()
    {
    }

    openShrine(shrineDir)
    {

    }

    run()
    {
        /*
        // SARC Test
        //let sarcFile = "M:/Documents/roms/wiiu/unpacked/TEST/sarc/Dungeon009.pack";
        //let sarcFile = "/home/max/Documents/TEST/compressed/Dungeon018.pack";
        let sarcFile = "/home/max/Documents/TEST/compressed/Dungeon000.pack";

        const SARC = requireGlobal("lib/sarc/sarc.js");
        let sarc = new SARC();
        let files = sarc.parse(sarcFile);
        console.log(files);
        sarc.extractFiles("/home/max/Documents/TEST/sarc_test", "dng000", true);
        */

        let aampFile = "/home/max/Documents/TEST/sarc_test/dng000/Map/CDungeon/Dungeon000/Dungeon000_Dynamic.smubin.unpacked.bin";
        const AAMP = requireGlobal("lib/aamp/aamp.js");
        let aamp = new AAMP();
        aamp.parse(aampFile);

    }

};
