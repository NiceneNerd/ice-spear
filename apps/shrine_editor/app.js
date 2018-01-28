/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const electron = require('electron');
const fs       = require('fs');
const path     = require('path');
const url      = require('url');
const Split    = require('split.js');

const Tab_Manager   = requireGlobal('lib/tab_manager.js');
const HTML_Loader   = requireGlobal("lib/html_loader.js");
const BYAML         = requireGlobal("lib/byaml/byaml.js");

const {dialog} = electron.remote;
const BrowserWindow = electron.remote.BrowserWindow;

const App_Base = requireGlobal("apps/base.js");

module.exports = class App extends App_Base
{
    constructor(window, args)
    {
        super(window, args);

        this.dataActorDyn = {};

        this.footerNode = footer.querySelector(".data-footer");
        this.actorDynList = this.node.querySelector(".data-actorDynList");

        this.htmlListEntry = new HTML_Loader('./html/bfres_file_tab.html');

        Split(['#main-sidebar-1', '#main-sidebar-2', '#main-sidebar-3'], {
            sizes     : [25, 25, 50],
            minSize   : 0,
            snapOffset: 60,
            gutterSize: 12
        });

        this.clear();
    }

    clear()
    {
    }

    openShrine(shrineDirOrFile)
    {
        // TEST
        let byamlFile = "/home/max/Documents/TEST/sarc_test/dng000/Map/CDungeon/Dungeon000/Dungeon000_Dynamic.smubin.unpacked.bin";
        let byaml = new BYAML();
        this.dataActorDyn = byaml.parse(byamlFile);

        this.render();
    }

    render()
    {
        this.footerNode.innerHTML = "Shrine file: " + this.footerNode;

        console.log(this.dataActorDyn);
        if(this.dataActorDyn != null && this.dataActorDyn.Objs != null)
        {
            for(let obj of this.dataActorDyn.Objs)
            {
                let name = obj.UnitConfigName;

                // render actor data
                let entryNode = this.htmlListEntry.create();

                entryNode.querySelector(".data-fileEntry-type").innerHTML = name;
                entryNode.querySelector(".data-fileType-num").innerHTML   = "";
                entryNode.querySelector(".data-fileEntry-description").innerHTML = obj.HashId;

                this.actorDynList.append(entryNode);
            }
        }
    }

    run()
    {
        this.openShrine("/home/max/Documents/TEST/compressed/Dungeon000.pack");

        // SARC Test
        //let sarcFile = "M:/Documents/roms/wiiu/unpacked/TEST/sarc/Dungeon009.pack";
        //let sarcFile = "/home/max/Documents/TEST/compressed/Dungeon018.pack";
        let sarcFile = "/home/max/Documents/TEST/compressed/Dungeon000.pack";
        //let sarcFile = "/home/max/Documents/TEST/DgnObj_IvyBurn.sbactorpack";

        let byamlFile = "/home/max/Documents/TEST/sarc_test/dng000/Map/CDungeon/Dungeon000/Dungeon000_Dynamic.smubin.unpacked.bin";

/*
        const SARC = requireGlobal("lib/sarc/sarc.js");
        let sarc = new SARC();
        let files = sarc.parse(sarcFile);
        console.log(files);
        sarc.extractFiles("/home/max/Documents/TEST/sarc_test", "dng000", true);
*/
/*
        const BYAML = requireGlobal("lib/byaml/byaml.js");
        let byaml = new BYAML();
        let byamlJson = byaml.parse(byamlFile);
        console.log(byamlJson);
*/
    }

};
