/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Shrine_Renderer     = require("./shrine/renderer.js");
const Shrine_Model_Loader = require("./shrine/model_loader.js");
const Shrine_Creator      = require("./shrine/creator.js")

const Actor_Handler = require("./actor/handler.js");
const Actor_Editor  = require("./actor_editor/editor.js");
const Actor_Loader  = require("./actor/loader.js");

module.exports = class Shrine_Editor
{
    /**
     * @param {Node} canvasNode 
     * @param {Node} uiNode
     * @param {Loader} loader
     * @param {stringTable} stringTable optional string table object
     */
    constructor(canvasNode, uiNode, loader, stringTable = undefined)
    {
        this.THREE = THREE;
        this.shrineDir  = "";
        this.shrineName = "";
        this.loader = loader;
        this.stringTable  = stringTable;
        
        this.shrineRenderer = new Shrine_Renderer(canvasNode, uiNode, this.loader);
        this.shrineModelLoader = new Shrine_Model_Loader();

        this.actorHandler = new Actor_Handler(this.shrineRenderer, this.loader, this.stringTable);
        this.actorEditor  = new Actor_Editor(this.shrineRenderer, this.actorHandler);
        this.actorLoader  = new Actor_Loader(this.actorHandler);

        this.actorHandler.actorEditor = this.actorEditor;
        
        this.shrineCreator = new Shrine_Creator(this.actorHandler);
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

    /**
     * resets the editor and it's renderer
     */
    clear()
    {
        this.shrineRenderer.clear();
    }

    /**
     * saves all shrine related data
     * @param {bool} rebuild if true, it rebuilds the .pack file
     */
    async save(rebuild = true)
    {
        return await this.shrineCreator.save(this.shrineDir, this.shrineName, rebuild);
    }
}
