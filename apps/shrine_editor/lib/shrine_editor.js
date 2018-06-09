/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs    = require('fs-extra');
const path  = require('path');
const BYAML = require("byaml-lib");
const SARC  = require("sarc-lib");
const yaz0  = require("yaz0-lib");

const Shrine_Renderer    = require("./shrine_renderer.js");
const Shrine_Model_Loader = require("./shrine/model_loader.js");

const Actor_Handler = require("./actor/handler.js");
const Actor_Editor  = require("./actor_editor/editor.js");
const Actor_Loader  = require("./actor/loader.js");

module.exports = class Shrine_Editor
{
    /**
     * @param {Node} canvasNode 
     */
    constructor(canvasNode, stringTable = null)
    {
        this.THREE = THREE;
        this.shrineDir  = "";
        this.shrineName = "";

        this.stringTable  = stringTable;
        
        this.shrineRenderer = new Shrine_Renderer(canvasNode);
        this.shrineModelLoader = new Shrine_Model_Loader();

        this.actorHandler = new Actor_Handler(this.shrineRenderer, this.stringTable);
        this.actorEditor  = new Actor_Editor(this.actorHandler);
        this.actorLoader  = new Actor_Loader(this.actorHandler);

        this.loader = null;
    }

    /**
     * Load a shrine and it's models, textures, actors and other stuff
     * @param {string} directory directory of the shrine
     * @param {string} name name of the shrine
     */
    async load(directory, name)
    {
        this.shrineDir = directory;
        this.shrineName = name;

        this.actorHandler.loader = this.loader;
        await this.actorHandler.loadActorDatabase();

        this.shrineModelLoader.loader = this.loader;
        const shrineModels = await this.shrineModelLoader.load(this.shrineDir, this.shrineName);
        this.shrineRenderer.setShrineModels(shrineModels);

        if(this.loader)await this.loader.setStatus("Adding Actors to Scene");

        await this.actorLoader.load(this.shrineDir, this.shrineName);
    }

    /**
     * starts the editor and it's renderer
     */
    start()
    {
        this.shrineRenderer.start();
    }

    clear()
    {
        this.shrineRenderer.clear();
    }

    async save()
    {
        const packPath = this.shrineDir.replace(".unpacked", "");

        await Promise.all([
            this.saveActors("Dynamic"),
            this.saveActors("Static"),
        ]);

        const sarc = new SARC();
        await sarc.fromDirectory(this.shrineDir);
        await sarc.save(packPath);
    }

    async saveActors(typeName)
    {
        const actorPath = path.join(this.shrineDir, "Map", "CDungeon", this.shrineName, `${this.shrineName}_${typeName}.smubin`); 
        const byaml = new BYAML.Creator();
        const actorBuffer = byaml.create(typeName == "Dynamic" ? this.actorHandler.dataActorDyn : this.actorHandler.dataActorStatic);
        const actorYaz = yaz0.encode(actorBuffer);

        await fs.writeFile(actorPath, actorYaz);
    }
}
