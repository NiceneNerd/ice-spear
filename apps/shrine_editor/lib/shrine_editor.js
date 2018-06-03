/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs    = require('fs');
const path  = require('path');
const BYAML = require("byaml-lib").Parser;

const Binary_File_Loader = require("binary-file").Loader;
const BFRES_Parser       = requireGlobal('lib/bfres/parser.js');
const Shrine_Renderer    = require("./shrine_renderer.js");
const Actor_Handler      = require("./actor/handler.js");

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

        this.dataActorDyn = {};
        this.dataActorStatic = {};

        this.stringTable  = stringTable;
        
        this.fileLoader     = new Binary_File_Loader();
        this.shrineRenderer = new Shrine_Renderer(canvasNode);
        this.actorHandler   = new Actor_Handler(this.shrineRenderer, this.stringTable);

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
        await this._loadShrineModel();

        this.dataActorDyn = await this._loadActors("Dynamic");
        this.dataActorStatic = await this._loadActors("Static");

        if(this.loader)await this.loader.setStatus("Adding Actors to Scene");

        if(this.dataActorDyn != null && this.dataActorDyn.Objs != null)
            await this.addMultipleActors(this.dataActorDyn.Objs);

        if(this.dataActorStatic != null && this.dataActorStatic.Objs != null)
            await this.addMultipleActors(this.dataActorStatic.Objs);
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

    /**
     * loads the shrine BFRES model, also tries to load the texture file
     */
    async _loadShrineModel()
    {
        let shrineModelPath = path.join(this.shrineDir, "Model", "DgnMrgPrt_" + this.shrineName + ".sbfres");
        if(fs.existsSync(shrineModelPath))
        {
            let modelBuffer = this.fileLoader.buffer(shrineModelPath);

            this.shrineBfresParser = new BFRES_Parser(true);
            this.shrineBfresParser.loader = this.loader;

            if(await this._loadShrineTexture())
                this.shrineBfresParser.setTextureParser(this.texBfresParser);

            if(await this.shrineBfresParser.parse(modelBuffer))
            {
                let shrineModels = this.shrineBfresParser.getModels();
                Object.values(shrineModels).forEach(subModel => this.shrineRenderer.setShrineModels(subModel));

                return true;
            }
        }
        return false;
    }

    /**
     * tries to load the Tex2 texture file
     */
    async _loadShrineTexture()
    {
        let shrineTexPath = path.join(this.shrineDir, "Model", "DgnMrgPrt_" + this.shrineName + ".Tex2.sbfres");
        if(fs.existsSync(shrineTexPath))
        {
            let texBuffer = this.fileLoader.buffer(shrineTexPath);

            this.texBfresParser = new BFRES_Parser(true);
            this.texBfresParser.loader = this.loader;
            if(await this.texBfresParser.parse(texBuffer))
            {
                return true;
            }
        }

        return false;
    }

    /**
     * loads dynamic or static actors from the shrine actor BYAML files
     * @returns undefined or an object with the parsed BYAML
     */
    async _loadActors(typeName)
    {
        let fileActors = path.join(this.shrineDir, "Map", "CDungeon", this.shrineName, `${this.shrineName}_${typeName}.smubin`);
        if(fs.existsSync(fileActors))
        {
            let byaml = new BYAML();
            return byaml.parse(this.fileLoader.buffer(fileActors));
            //await this._getAllActorTypes();
        }

        return undefined;
    }

    /**
     * tries to get all actor types from the actor BYAML
     */
    /*
    async _getAllActorTypes()
    {
        let types = {};
        if(this.dataActorDyn != null && this.dataActorDyn.Objs != null)
        {
            for(let obj of this.dataActorDyn.Objs)
            {
                let type = obj.UnitConfigName.value;
                if(types[type] == null)
                {
                    types[type] = type;

                    let actorData = await this.actorHandler.getActorData(type);
                    if(actorData != null)
                    {
                        console.log(actorData.bfresParser.getModels());
                    }
                }
                
            }
        }

        console.log(types);
        return types;
    }
    */

    async addMultipleActors(actorObjectArray)
    {
        for(let obj of actorObjectArray)
        {
            let name = obj.UnitConfigName.value;
            if(name == "DgnObj_Hrl_CandleStandA_01")
                await this.addActor(name, obj);
        }
    }

    async addActor(name, params)
    {        
        const actor = await this.actorHandler.addActor(name, params);
        this.shrineRenderer.addActor(actor);
    }
}
