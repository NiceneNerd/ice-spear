/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Mubin_Renderer = require("./renderer");
const Actor_Handler  = require("./actor/handler");
const Actor_Editor   = require("./actor_editor/editor");

const Actor_Loader   = require("./actor/loader");
const PROD_Loader    = require("./prod/loader");

module.exports = class Mubin_Editor
{
    /**
     * @param {Node} canvasNode 
     * @param {Node} uiNode
     * @param {Project_Manager} project
     * @param {Loader} loader
     * @param {stringTable} stringTable optional string table object
     */
    constructor(canvasNode, uiNode, project, loader, stringTable = undefined)
    {
        this.THREE = THREE;
        this.mubinDir  = "";
        this.mubinName = "";

        this.project = project;
        this.loader = loader;
        this.stringTable  = stringTable;
        
        this.mubinRenderer = new Mubin_Renderer(canvasNode, uiNode, this.loader);
        this.actorHandler  = new Actor_Handler(this.mubinRenderer, this.project, this.loader, this.stringTable);
        this.actorEditor   = new Actor_Editor(this.mubinRenderer, this.actorHandler);

        this.actorLoader = new Actor_Loader(this.actorHandler, (actorType) => this.generateMubinPath(actorType));
        this.prodLoader  = new PROD_Loader( this.actorHandler, (actorType) => this.generateProdPath(actorType));

        this.loadActorData = true;
        this.loadProdData  = false;

        this.actorHandler.actorEditor = this.actorEditor;
    }

    /**
     * maps the actory type to the actual mubin location, this will differ between shrines and the main-field
     * @param {string} actorType 
     */
    generateMubinPath(actorType)
    {
        console.warn("No mubin type to path mapping implemented!");
        return undefined;
    }

    /**
     * maps the prod type to the actual prod location, this will differ between shrines and the main-field
     * @param {string} prodType 
     * @returns {string|undefined} 
     */
    generateProdPath(prodType)
    {
        console.warn("No prod type to path mapping implemented!");
        return undefined;
    }

    /**
     * loads the map model (field or shrine)
     */
    async loadMapModel()
    {
        console.warn("No Map file-loaded implemented!");
    }

    /**
     * Loads map models, textures, actors and other stuff
     * @param {string} directory base directory
     * @param {string} name name
     */
    async load(directory, name)
    {
        this.mubinDir = directory;
        this.mubinName = name;
        this.actorHandler.loader = this.loader;

        await this.loadMapModel();

        await this.actorHandler.loadActorDatabase();
        
        if(this.loadActorData)
        {
            if(this.loader)await this.loader.setStatus("Loading Mubin-Actors");
            await this.actorLoader.load(this.mubinDir, this.mubinName);
        }

        if(this.loadProdData)
        {
            if(this.loader)await this.loader.setStatus("Loading PrOD-Objects");        
            await this.prodLoader.load(this.mubinDir, this.mubinName);
        }
    }

    getRenderer()
    {
        return this.mubinRenderer.renderer;
    }

    showInvisibleActors(isVisible)
    {
        this.mubinRenderer.actorGroup.children.forEach(model => {
            if(!model.userData.actor.object.hasOwnModel)
            {
                model.visible = isVisible;
            }
        });
    }

    showVisibleActors(isVisible)
    {
        this.mubinRenderer.actorGroup.children.forEach(model => {
            if(model.userData.actor.object.hasOwnModel)
            {
                model.visible = isVisible;
            }
        });
    }

    /**
     * starts the editor and it's renderer
     */
    start()
    {
        this.mubinRenderer.start();
    }

    /**
     * saves the mubin data
     * @param {bool} rebuild if true, it rebuilds the .pack file
     */
    async save(rebuild = true)
    {
        console.warn("No save method implemented!");
    }
}
