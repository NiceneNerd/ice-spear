/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs    = require('fs');
const BYAML = require("byaml-lib").Parser;

const Binary_File_Loader = require("binary-file").Loader;
const BFRES_Parser       = requireGlobal('lib/bfres/parser.js');
const Shrine_Renderer    = require("./shrine_renderer.js");
const Actor_Handler      = requireGlobal("lib/actor/actor_handler.js");

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

        this.stringTable  = stringTable;
        this.actorHandler = new Actor_Handler(this.stringTable);
        
        this.fileLoader = new Binary_File_Loader();
        this.renderer   = new Shrine_Renderer(canvasNode);
        this.loader     = null;
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
        await this.actorHandler.load();

        await this._loadShrineModel();
        await this._loadDynamicActors();

        await this._addActorsToScene();
    }

    /**
     * starts the editor and it's renderer
     */
    start()
    {
        this.renderer.start();
    }

    clear()
    {
        this.renderer.clear();
    }

    /**
     * loads the shrine BFRES model, also tries to load the texture file
     */
    async _loadShrineModel()
    {
        let shrineModelPath = this.shrineDir + "Model/DgnMrgPrt_" + this.shrineName + ".sbfres";
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

                if(shrineModels[0] != null)
                        this.renderer.setShrineModels(shrineModels[0]);

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
        let shrineTexPath = this.shrineDir + "Model/DgnMrgPrt_" + this.shrineName + ".Tex2.sbfres";
        console.log(shrineTexPath);
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
     * loads dynamic actors from the BYAML file
     */
    async _loadDynamicActors()
    {
        if(this.loader)await this.loader.setStatus("Loading Actors (Dynamic)");

        let fileActorsDyn = this.shrineDir + "Map/CDungeon/" + this.shrineName + "/" + this.shrineName + "_Dynamic.smubin";
        if(fs.existsSync(fileActorsDyn))
        {
            let byaml = new BYAML();
            this.dataActorDyn = byaml.parse(this.fileLoader.buffer(fileActorsDyn));
            //await this._getAllActorTypes();
            return true;
        }
        return false;
    }

    /**
     * tries to get all actor types from the actor BYAML
     */
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

    /**
     * adds all actors to the scene
     */
    async _addActorsToScene()
    {
        if(this.dataActorDyn != null && this.dataActorDyn.Objs != null)
        {
            if(this.loader)await this.loader.setStatus("Adding Actors to Scene");

            for(let obj of this.dataActorDyn.Objs)
            {
                let name = obj.UnitConfigName.value;

                let pos = new this.THREE.Vector3(0.0, 0.0, 0.0);
                let rot = new this.THREE.Vector3(0.0, 0.0, 0.0);

                if(obj.Translate[0] == null) // leave it in until i know that that doesn't happen
                {
                    console.log(obj);
                    throw "Translate is not an array";
                }

                if(obj.Translate != null)
                    pos.fromArray(BYAML.toRawValues(obj.Translate));

                if(obj.Rotate != null)
                {
                    if(obj.Rotate.length == null)
                    {
                        rot.y = obj.Rotate.value;
                    }else{
                        rot.fromArray(BYAML.toRawValues(obj.Rotate));
                    }
                }
                
                let actorData = await this.actorHandler.getActorData(name);
                let actorObj = this.renderer.addActor(actorData, pos, rot);   
            }
        }
    }
}
