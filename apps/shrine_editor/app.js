/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const electron = require('electron');
const fs       = require('fs-extra');
const path     = require('path');
const url      = require('url');
const Split    = require('split.js');

const Notify      = requireGlobal("lib/notify/notify.js");
const Filter      = requireGlobal("lib/filter.js");

const Binary_File_Loader = require("binary-file").Loader;
const SARC          = require("sarc-lib");
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
        
/*
        this.actorDynList = this.node.querySelector(".data-actorDynList");
        this.filterActorDyn = new Filter(this.actorDynList.querySelector(".list-group-header input"), this.actorDynList, ".list-group-item");
*/
        this.fileLoader = new Binary_File_Loader();

        this.stringTable = new String_Table(this.project.getCachePath());

        this.shrineEditor = new Shrine_Editor(this.node.querySelector(".shrine-canvas"), this.node, this.stringTable);
        this.shrineEditor.loader = this.loader;

        Split(['#main-sidebar-1', '#main-sidebar-2', '#main-sidebar-3'], {
            sizes     : [10, 70, 20],
            minSize   : 0,
            snapOffset: 60,
            gutterSize: 12
        });

        this.observerCanvas = new MutationObserver(mutations => this.shrineEditor.shrineRenderer.renderer.updateDrawSize());
        this.observerCanvas.observe(document.querySelector("#main-sidebar-2"), {attributes: true});

        this.initTools();
    }

    initTools()
    {
        this.node.querySelector(".data-tool-save").onclick = () => this.save(false);
        this.node.querySelector(".data-tool-saveBuild").onclick = () => this.save(true);
    }

    /**
     * saves the shrine
     * @param {bool} repack if true, it rebuilds the .pack file
     */
    async save(rebuild = true)
    {
        await this.shrineEditor.save(rebuild);

        Notify.success(`Shrine '${this.shrineName}' saved`);
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
            this.stringTable.loader = this.loader;
            //await this.stringTable.load(); // not needed now, yay!

            if(typeof(global.gc) == "function") // free some memory after maybe loading the stringtable
                global.gc();
                
            let fileName = shrineDirOrFile.split(/[\\/]+/).pop();
            this.shrineDir = path.join(this.project.getShrinesPath(), fileName + ".unpacked");

            this.shrineName = fileName.match(/Dungeon[0-9]+/);

            if(this.shrineName != null)
                this.shrineName = this.shrineName[0];

            const alreadyExtracted = await fs.pathExists(this.shrineDir);

            // extract if it's not a directory
            if(!alreadyExtracted && fs.lstatSync(shrineDirOrFile).isFile())
            {
                let sarc = new SARC(this.stringTable);
                this.shrineFiles = sarc.parse(shrineDirOrFile);
                await sarc.extractFiles(this.shrineDir, true);
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

        this.node.querySelector(".data-shrine-name").innerHTML = this.shrineName;

        this.node.querySelector(".data-actors-staticCount").innerHTML  = this.shrineEditor.actorHandler.dataActorStatic.Objs.length;
        this.node.querySelector(".data-actors-dynamicCount").innerHTML = this.shrineEditor.actorHandler.dataActorDyn.Objs.length;


        /*
        if(this.shrineEditor.dataActorDyn != null && this.shrineEditor.dataActorDyn.Objs != null)
        {
            for(let obj of this.shrineEditor.dataActorDyn.Objs)
            {
                let name = obj.UnitConfigName.value;

                // render actor data
                let entryNode = this.htmlListEntry.create();

                entryNode.querySelector(".data-fileEntry-type").innerHTML = name;
                entryNode.querySelector(".data-fileType-num").innerHTML = "";
                entryNode.querySelector(".data-fileEntry-description").innerHTML = obj.HashId.value;

                this.actorDynList.append(entryNode);
            }
        }
        */
        this.shrineEditor.start();
    }

    async run()
    {
        await super.run();

        // 000 = ivy shrine
        // 006 = physics + guardians
        // 033 = water puzzle, missing polygon in corner
        // 051 = has lava and spikeballs
        // 099 = blessing
        let filePath = this.config.getValue("game.path") + "/content/Pack/Dungeon000.pack";
        //let filePath = "";

        if(this.args.file != null) {
            filePath = this.args.file;
        }

        this.openShrine(filePath);
    }    
};
