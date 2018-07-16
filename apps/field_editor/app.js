/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const electron = require('electron');
const fs       = require('fs-extra');
const path     = require('path');
const Split    = require('split.js');
const {dialog} = electron.remote;

const Notify      = requireGlobal("lib/notify/notify.js");
const Filter      = requireGlobal("lib/filter.js");

const Field_Editor  = require("./lib/field_editor.js");
const String_Table  = requireGlobal("lib/string_table/string_table.js");
const extractField  = require("./lib/field_extractor");

const App_Base = requireGlobal("apps/base.js");

module.exports = class App extends App_Base
{
    constructor(window, args)
    {
        super(window, args);

        this.fieldGamePath = path.join(this.config.getValue("game.path"), "content", "Map", "MainField");
        this.fieldStaticGamePath = path.join(this.config.getValue("game.path"), "content", "Physics", "StaticCompound", "MainField");

        this.fieldDir = null;
        this.fieldSection = null;

        this.footerNode = footer.querySelector(".data-footer");
        
        this.stringTable = new String_Table(this.project.getCachePath());

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
        this.node.querySelector(".data-tool-save").onclick = () => this.save();
        this.node.querySelector(".data-tool-openFieldDir").onclick = () => {
            electron.shell.showItemInFolder(this.fieldEditor.getFieldFilePath());
        };
    }


    /**
     * saves the field
     */
    async save()
    {
        await this.loader.setStatus("Saving Field");
        await this.loader.show();

        await this.fieldEditor.save();

        await this.loader.hide();
        Notify.success(`Field '${this.fieldSection}' saved`);
    }

    async openField(fieldSection)
    {
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

            if(!alreadyOpened)
            {
                await extractField(this.fieldGamePath, this.fieldStaticGamePath, this.fieldDir, this.fieldSection);
            }

            await this.fieldEditor.load(this.fieldDir, this.fieldSection);
        
            this.render();

            // some performance cuts
            this.fieldEditor.setRenderSetting("targetFPS", "number", 30);
            this.fieldEditor.setRenderSetting("camSpeed", "number", 2);
            //this.fieldEditor.setRenderSetting("accurateTimer", "bool", true);

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

        this.fieldEditor = new Field_Editor(this.node.querySelector(".shrine-canvas"), this.node, this.project, this.loader, this.stringTable);

        /**
         * I-3 - the cool town + guardian field
         * C-7 - some gerudo cliff area
         */
        let fieldSection = "C-7";

        if(this.args.section) {
            fieldSection = this.args.section;
        }

        await this.openField(fieldSection);
    }    
};
