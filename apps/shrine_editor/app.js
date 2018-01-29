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
const SARC          = requireGlobal("lib/sarc/sarc.js");
const Shrine_Editor = require("./lib/shrine_editor.js");

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

        this.shrineEditor = new Shrine_Editor(this.node.querySelector(".shrine-canvas"));

        Split(['#main-sidebar-1', '#main-sidebar-2', '#main-sidebar-3'], {
            sizes     : [25, 25, 50],
            minSize   : 0,
            snapOffset: 60,
            gutterSize: 12
        });

        this.observerCanvas = new MutationObserver(mutations => this.shrineEditor.renderer.updateDrawSize());
        this.observerCanvas.observe(document.querySelector("#main-sidebar-3"), {attributes: true});
/*
        this.observerApp = new MutationObserver(mutations => this.threeJsRenderer.updateDrawSize());
        this.observerApp.observe(this.node.querySelector(".sidebar-2"), {attributes: true});
*/

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

        this.shrineEditor.load(this.shrineDir, this.shrineName);

        this.render();
    }

    render()
    {

        this.footerNode.innerHTML = "Loaded Shrine: " + this.shrineDir;

        //console.log(this.shrineEditor.dataActorDyn);

        if(this.shrineEditor.dataActorDyn != null && this.shrineEditor.dataActorDyn.Objs != null)
        {
            for(let obj of this.shrineEditor.dataActorDyn.Objs)
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

        this.shrineEditor.start();
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
