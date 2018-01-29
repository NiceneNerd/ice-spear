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

const Filter      = requireGlobal("lib/filter.js");
const Tab_Manager   = requireGlobal('lib/tab_manager.js');
const HTML_Loader   = requireGlobal("lib/html_loader.js");
const Binary_File_Loader = requireGlobal('./lib/binary_file/file_loader.js');
const BYAML         = requireGlobal("lib/byaml/byaml.js");
const SARC          = requireGlobal("lib/sarc/sarc.js");

const {dialog} = electron.remote;
const BrowserWindow = electron.remote.BrowserWindow;

const App_Base = requireGlobal("apps/base.js");

module.exports = class App extends App_Base
{
    constructor(window, args)
    {
        super(window, args);

        this.dataActorDyn = {};

        this.projectDir = "M:/Documents/roms/wiiu/ice-spear-projects/";
        this.shrineDir  = null;
        this.shrineFiles = null;

        this.footerNode = footer.querySelector(".data-footer");
        this.actorDynList = this.node.querySelector(".data-actorDynList");

        this.filterActorDyn = new Filter(this.actorDynList.querySelector(".list-group-header input"), this.actorDynList, ".list-group-item");

        this.htmlListEntry = new HTML_Loader('./html/bfres_file_tab.html');
        this.fileLoader = new Binary_File_Loader();

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
        let fileName = shrineDirOrFile.split(/[\\/]+/).pop();
        this.shrineDir = this.projectDir + "shrines/" + fileName + "/";

        this.shrineName = fileName.match(/Dungeon[0-9]+/);
        if(this.shrineName != null)
            this.shrineName = this.shrineName[0];

        // extract if it's not a directory
        if(fs.lstatSync(shrineDirOrFile).isFile())
        {
            let sarc = new SARC();
            this.shrineFiles = sarc.parse(shrineDirOrFile);
            sarc.extractFiles(this.projectDir + "shrines", fileName, true);
        }

        // load dynamic actors
        let fileActorsDyn = this.shrineDir + "Map/CDungeon/" + this.shrineName + "/" + this.shrineName + "_Dynamic.smubin";
        if(fs.existsSync(fileActorsDyn))
        {
            let byaml = new BYAML();
            this.dataActorDyn = byaml.parse(this.fileLoader.buffer(fileActorsDyn));
        }

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
                entryNode.querySelector(".data-fileType-num").innerHTML = "";
                entryNode.querySelector(".data-fileEntry-description").innerHTML = obj.HashId;

                this.actorDynList.append(entryNode);
            }
        }
    }

    run()
    {
        // SARC Test
        //let sarcFile = "M:/Documents/roms/wiiu/unpacked/TEST/sarc/Dungeon009.pack";
        let sarcFile = "M:/Documents/roms/wiiu/unpacked/TEST/sarc/Dungeon000.pack";
        //let sarcFile = "/home/max/Documents/TEST/compressed/Dungeon018.pack";
        //let sarcFile = "/home/max/Documents/TEST/compressed/Dungeon000.pack";
        //let sarcFile = "/home/max/Documents/TEST/DgnObj_IvyBurn.sbactorpack";

        this.openShrine(sarcFile);
    }

};
