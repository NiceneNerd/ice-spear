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
const HTML_Loader   = requireGlobal("lib/html_loader.js");
const Binary_File_Loader = requireGlobal('./lib/binary_file/file_loader.js');
const SARC          = requireGlobal("lib/sarc/sarc.js");
const Shrine_Editor = require("./lib/shrine_editor.js");
const String_Table  = requireGlobal("lib/string_table/string_table.js");

const {dialog} = electron.remote;
const BrowserWindow = electron.remote.BrowserWindow;

const App_Base = requireGlobal("apps/base.js");

module.exports = class App extends App_Base
{
    constructor(window, args)
    {
        super(window, args);

        this.dataActorDyn = {};

        this.shrineDir  = null;
        this.shrineFiles = null;

        this.footerNode = footer.querySelector(".data-footer");

        this.actorDynList = this.node.querySelector(".data-actorDynList");
        this.filterActorDyn = new Filter(this.actorDynList.querySelector(".list-group-header input"), this.actorDynList, ".list-group-item");

        this.htmlListEntry = new HTML_Loader('./html/bfres_file_tab.html');
        this.fileLoader = new Binary_File_Loader();

        this.stringTable = new String_Table();

        this.shrineEditor = new Shrine_Editor(this.node.querySelector(".shrine-canvas"), this.stringTable);
        this.shrineEditor.loader = this.loader;

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

        this.project.reopenLast();
    }

    clear()
    {
        this.shrineEditor.clear();
    }

    async openShrine(shrineDirOrFile = null)
    {
        if(shrineDirOrFile == "" || shrineDirOrFile == null)
        {
            let paths = dialog.showOpenDialog({properties: ['openDirectory']});
            if(paths != null)
                shrineDirOrFile = path[0];
            else 
                return false;
        }

        await this.loader.show();
        await this.loader.setStatus("Loading Shrine");
        try{
            this.clear();

            this.stringTable.loader = this.loader;
            await this.stringTable.load();

            if(typeof(global.gc) == "function") // free some memory after maybe loading the stringtable
                global.gc();
                
            let fileName = shrineDirOrFile.split(/[\\/]+/).pop();
            this.shrineDir = this.project.path + "shrines/" + fileName + "/";

            this.shrineName = fileName.match(/Dungeon[0-9]+/);

            if(this.shrineName != null)
                this.shrineName = this.shrineName[0];

            // extract if it's not a directory
            if(fs.lstatSync(shrineDirOrFile).isFile())
            {
                let sarc = new SARC(this.stringTable);
                this.shrineFiles = sarc.parse(shrineDirOrFile);
                sarc.extractFiles(this.project.path + "shrines", fileName, true);
            }

            await this.shrineEditor.load(this.shrineDir, this.shrineName);

            this.render();

        } catch(e) {
            await this.loader.hide();    
            throw e;
        }

        await this.loader.hide();
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
        // 000 = ivy shrine
        // 006 = physics + guardians
        // 099 = blessing
        let filePath = this.config.getValue("game.path") + "/content/Pack/Dungeon000.pack";
        //let filePath = "";

        if(this.args.file != null) {
            filePath = this.args.file;
        }

        //this.openShrine(filePath);

        // BXML Test
        
        this.stringTable.load();
        const BXML  = requireGlobal("lib/bxml/bxml.js");

        let bxmlInPath = this.project.path + "/shrines/Dungeon000.pack/Actor/Pack/DgnMrgPrt_Dungeon000.sbactorpack.unpacked/Actor/AIProgram/MergedDungeonParts.baiprog";
        let bxmlIn = new BXML(this.stringTable);
        let bxmlJson = bxmlIn.parse(bxmlInPath);
        console.log(bxmlJson);
        fs.writeFileSync("./test.json", JSON.stringify(bxmlJson, null, 4));
/*
        let bxmlOutPath = this.project.path + "/shrines/Dungeon000.pack/Actor/Pack/DgnMrgPrt_Dungeon000.sbactorpack.unpacked/Actor/AIProgram/MergedDungeonParts.test.baiprog";
        let bxmlOut = new BXML(this.stringTable);
        let bxmlBuffer = bxmlOut.create(bxmlJson);
        console.log(bxmlBuffer);

        if(bxmlBuffer != null)
            fs.writeFileSync(bxmlOutPath, bxmlBuffer);
*/
    }    
};
