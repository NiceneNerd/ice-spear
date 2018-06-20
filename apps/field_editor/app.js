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
const Field_Editor  = require("./lib/field_editor.js");
const String_Table  = requireGlobal("lib/string_table/string_table.js");

const {dialog} = electron.remote;
const BrowserWindow = electron.remote.BrowserWindow;

const App_Base = requireGlobal("apps/base.js");

module.exports = class App extends App_Base
{
    constructor(window, args)
    {
        super(window, args);

        this.fieldGamePath = path.join(this.config.getValue("game.path"), "content", "Map", "MainField");
        this.fieldSection  = null;
        this.fieldDir      = null;

        this.footerNode = footer.querySelector(".data-footer");
        
        this.fileLoader = new Binary_File_Loader();
        this.stringTable = new String_Table(this.project.getCachePath());
        this.fieldEditor = new Field_Editor(this.node.querySelector(".shrine-canvas"), this.node, this.project, this.loader, this.stringTable);

        Split(['#main-sidebar-1', '#main-sidebar-2', '#main-sidebar-3'], {
            sizes     : [10, 70, 20],
            minSize   : 0,
            snapOffset: 60,
            gutterSize: 12
        });

        this.initTools();
    }

    initTools()
    {
        this.node.querySelector(".data-tool-save").onclick = () => this.save(false);
        this.node.querySelector(".data-tool-openFieldDir").onclick = () => {
            //electron.shell.showItemInFolder(this.shrineEditor.getPackFilePath());
            console.warn("WIP");
        };

        const actorVisibleNode = this.node.querySelector(".data-tool-renderer-actorsVisible");
        actorVisibleNode.onchange = () => this.fieldEditor.showVisibleActors(actorVisibleNode.checked);

        const actorInvisibleNode = this.node.querySelector(".data-tool-renderer-actorsInvisible");
        actorInvisibleNode.onchange = () => this.fieldEditor.showInvisibleActors(actorInvisibleNode.checked);

        const postProcNode = this.node.querySelector(".data-tool-renderer-postProc");
        postProcNode.onchange = () => this.fieldEditor.getRenderer().usePostProcessing(postProcNode.checked);

        const camLightNode = this.node.querySelector(".data-tool-renderer-camLight");
        camLightNode.onchange = () => {
            this.fieldEditor.getRenderer().helper.lighting.cameraLight.visible = camLightNode.checked;
        };

        const showStatsNode = this.node.querySelector(".data-tool-renderer-showStats");
        showStatsNode.onchange = () => this.fieldEditor.getRenderer().useStats(showStatsNode.checked);

        const camSpeedNode = this.node.querySelector(".data-tool-renderer-camSpeed");
        camSpeedNode.onchange = () => {
            this.fieldEditor.getRenderer().helper.fpsControls.camSpeed = camSpeedNode.value;
        };
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

    async openField(fieldSection)
    {
        if(!fieldSection)
        {
            /*
            let paths = dialog.showOpenDialog({properties: ['openDirectory']});
            if(paths != null)
                shrineDirOrFile = path[0];
            else 
                return false;
                */
               console.warn("TODO");
               return false;
        }

        this.fieldSection = fieldSection;

        await this.loader.show();
        await this.loader.setStatus("Loading Field");
        try{
            this.stringTable.loader = this.loader;
            //await this.stringTable.load(); // not needed now, yay!

            if(typeof(global.gc) == "function") // free some memory after maybe loading the stringtable
                global.gc();
                
            this.fieldDir = path.join(this.project.getFieldPath("data"), this.fieldSection);
            const alreadyOpened = await fs.pathExists(this.fieldDir);

            await fs.ensureDir(this.fieldDir);

            // extract if it's not a directory
            if(!alreadyOpened)
            {
                await fs.copy(
                    path.join(this.fieldGamePath, this.fieldSection),
                    this.fieldDir
                );
            }

            await this.fieldEditor.load(this.fieldDir, this.fieldSection);
        
            this.render();

        } catch(e) {
            await this.loader.hide();    
            console.log(e);
            throw e;
        }

        await this.loader.hide();
    }

    render()
    {

        this.footerNode.innerHTML = "Loaded Field-Section: " + this.fieldDir;

        this.node.querySelector(".data-field-section").innerHTML = this.fieldSection;

        if(this.fieldEditor.actorHandler.dataActorStatic && this.fieldEditor.actorHandler.dataActorStatic.Objs)
            this.node.querySelector(".data-actors-staticCount").innerHTML  = this.fieldEditor.actorHandler.dataActorStatic.Objs.length;
            
        if(this.fieldEditor.actorHandler.dataActorDyn && this.fieldEditor.actorHandler.dataActorDyn.Objs)
            this.node.querySelector(".data-actors-dynamicCount").innerHTML = this.fieldEditor.actorHandler.dataActorDyn.Objs.length;

        let prodNum = 0;
        for(const prodSection of this.fieldEditor.actorHandler.dataActorProd)
        {
            this.node.querySelector(".data-actors-prodCount-" + (prodNum++)).innerHTML = prodSection.length;
        }

        this.fieldEditor.start();
    }

    async run()
    {
        await super.run();

        /**
         * I-3 - the cool town + guardian field
         * C-7 - some gerudo cliff area
         */
        let fieldSection = "J-3";

        if(this.args.file != null) {
            fieldSection = this.args.file;
        }

        this.openField(fieldSection);
    }    
};
