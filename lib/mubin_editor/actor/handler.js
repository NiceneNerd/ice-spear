/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs');
const uuid = require("uuid/v4");
const path = require("path");

const Main_Config        = requireGlobal("./lib/config/main_config");
const Binary_File_Loader = require("binary-file").Loader;
const BFRES_Parser       = requireGlobal('lib/bfres/parser');
const BFRES_Container    = requireGlobal('lib/bfres/container');

const Actor_Object = require('./actor_object');
const Actor        = require('./actor');
const Actor_Params = require('./params');
const Actor_Cache  = require('./cache/cache');

const BYAML = require("byaml-lib");
const BXML  = requireGlobal("lib/bxml/bxml");
const SARC  = require("sarc-lib");

module.exports = class Actor_Handler
{
    /**
     * @param {Shrine_Renderer} shrineRenderer 
     * @param {Loader} loader 
     * @param {String_Table} stringTable 
     */
    constructor(shrineRenderer, project, loader, stringTable = null)
    {
        this.shrineRenderer = shrineRenderer;
        this.loader = this.loader;
        this.stringTable = stringTable;
        this.actorEditor = undefined;

        this.dataActorDyn    = {};
        this.dataActorStatic = {};
        this.dataActorProd   = [];

        this.fileLoader = new Binary_File_Loader();

        if(project.mainConfig.getValue("cache.actors"))
            this.actorCache = new Actor_Cache(project.getCachePath());

        let cfg = new Main_Config();
        this.actorPath  = cfg.getValue("game.path") + "/content/Actor";
        this.modelsPath = cfg.getValue("game.path") + "/content/Model";

        this.clear();
    }

    clear()
    {
        this.actors = {};
        this.actorInfo = {};
        this.bfresFiles = {};

        this.objects = {};
        this.objects.DUMMY_BOX = new Actor_Object(this.shrineRenderer);
        this.objects.DUMMY_BOX.setThreeModel(this.shrineRenderer.renderer.createBox());
    }

    async showLoader(status = "", info = "")
    {
        await this.loader.setStatus(status);
        await this.loader.setInfo(info);
        await this.loader.show();
    }

    async hideLoader()
    {
        await this.loader.hide();
    }

    async loadActorDatabase()
    {
        await this.loader.setStatus("Loading Actor Database");
        await this.loader.setInfo("Parsing File");

        let byaml = new BYAML.Parser();
        this.actorData = byaml.parse(this.fileLoader.buffer(this.actorPath + "/ActorInfo.product.sbyml"));

        await this.loader.setInfo("Converting Data");

        for(let actor of this.actorData.Actors)
        {
            this.actorInfo[actor.name.value] = actor;
        }
    }

    /**
     * adds an actor (can be a mubin or PrOD object)
     * @param {string} name actor name
     * @param {Object} params BYAML params
     * @param {string|number} type "Dynamic"/"Static" or a number for PrOD files
     * @param {bool} alreadyIncluded if false, the params are added to the param object/array
     * @returns {Actor}
     */
    async addActor(name, params, type, alreadyIncluded = true)
    {
        const actorObject = await this.createActorObjectInstance(name);

        Actor_Params.normalize(params);

        const actor = new Actor(params, type, uuid(), actorObject);
        actor.setHandler(this);
        actor.update();

        if(alreadyIncluded)
        {
            switch(type)
            {
                case "Dynamic":
                    this.dataActorDyn.Objs.push(params);
                break;
                case "Static":
                    this.dataActorStatic.Objs.push(params);
                break;
                default: // PrOD
                    this.dataActorProd[type].push(params);
                break;
            }
        }

        this.actors[actor.id] = actor;
        this.shrineRenderer.addActor(actor);

        return actor;
    }

    /**
     * loads (if not already loaded) the actor object and returns a cloned instance of it
     * if no object can be found, a dummy box is returned
     * @param {string} name actor name
     * @returns {Actor_Object}
     */
    async createActorObjectInstance(name)
    {
        //let actorObject = await this._getActorObject(name) || await this._getActorObject("DUMMY_BOX", name);
        let actorObject = await this._getActorObject("DUMMY_BOX");

        if(actorObject.name == "DUMMY_BOX")
            actorObject.name = name;

        return actorObject.createInstance();
    }

    /**
     * removes an actor, also removes it from all other places (editor, renderer, obj array)
     * @param {Actor} actor actor to remove
     * @returns {boolean} false if it was already removed / not set here
     */
    async deleteActor(actor)
    {
        const paramObj = actor.type == "Dynamic" ? this.dataActorDyn.Objs : this.dataActorStatic.Objs;
        const objIndex = paramObj.indexOf(actor.params);
        if(objIndex >= 0)
        {
            paramObj.splice(objIndex, 1);
        }else{
            console.warn("Removed Actor's params are not in the BYAML file!");
            console.warn(actor);
            return false;
        }

        this.actorEditor.deselectActor(actor);
        this.shrineRenderer.deleteActor(actor);

        delete this.actors[actor.id];

        return true;
    }

    /**
     * copies an actor and adds it to the scene
     * @param {Actor} actor actor to copy
     * @returns {Actor} new actor
     */
    async copyActor(actor)
    {
        console.log(actor);
        const paramCopy = BYAML.Helper.deepCopy(actor.params);
        if(paramCopy.Translate)
        {
            paramCopy.Translate[1].value += 1.0;
            paramCopy.HashId.value = 0;
        }
        return await this.addActor(actor.getName(), paramCopy, actor.type);
    }
    
    /**
     * refreshes the actor model by removing and adding it again
     * should be called after an actor object changed
     * @param {Actor} actor 
     */
    refreshActorRenderer(actor)
    {
        this.shrineRenderer.deleteActor(actor);
        this.shrineRenderer.addActor(actor);
    }

    /**
     * assigns a new param object to the actor and the internal BYAML data
     * @param {Actor} actor 
     * @param {Object} params 
     */
    assignNewActorParams(actor, params)
    {
        const dataObj = actor.type == "Dynamic" ? this.dataActorDyn.Objs : this.dataActorStatic.Objs;
        const dataIndex = dataObj.indexOf(actor.params);
        if(dataIndex < 0)
        {
            console.warn("Actor assign new params, actor has no params set in Objs!");
            return undefined;
        }

        dataObj[dataIndex] = params;
        actor.params = dataObj[dataIndex];
        
        return dataObj[dataIndex];
    }

    async _getActorObject(name, aliasName = undefined)
    {
        if(!this.objects[name])
        {
            let mainModel = this.actorCache ? await this.actorCache.get(name) : undefined;
            
            if(!mainModel)
            {
                let actorInfo = await this._getActorInfo(name);
                if(!actorInfo)
                {
                    console.warn(`Actor_Handler._getActorData for ${name} returned nothing!`);
                    return undefined;
                }

                if(!actorInfo.bfresContainer || actorInfo.bfresContainer.isEmpty())
                {
                    //console.warn(`Actor_Handler._getActorData for ${name} returned no bfresParser!`);
                    return undefined;
                }

                let mainModelName = undefined;
                if(actorInfo.mainModel)
                    mainModelName = actorInfo.mainModel.value;

                mainModel = actorInfo.bfresContainer.getModel(mainModelName);

                if(this.actorCache)
                    await this.actorCache.cache(name, mainModel);
            }        
            
            this.objects[name] = new Actor_Object(this.shrineRenderer, mainModel);
        }

        if(aliasName && !this.objects[aliasName])
        {
            this.objects[aliasName] = this.objects[name];
        }

        return this.objects[name];
    }

    async _getActorInfo(name)
    {
        const info = this.actorInfo[name];

        if(info == null)
            return null;
        
        if(info.bfresContainer == null)
        {            
            if(info.bfres != null)
            {
                info.bfresContainer = await this._getActorBfresFiles(info.bfres.value);
            }else{
                //console.warn("Actor is missing the BFRES setting: " + name);
            }
        }
/*
        let actorPackPath = this.actorPath + "/Pack/" + name + ".sbactorpack";
        if(fs.existsSync(actorPackPath))
        {
            let sarc = new SARC(this.stringTable);
            let files = sarc.parse(actorPackPath);

            let modelListBuff = sarc.getFile(`Actor/ModelList/${name}.bmodellist`);
            if(modelListBuff == null)return null;

            let bxml = new BXML(this.stringTable);
            let bxmlData = bxml.parse(this.fileLoader.buffer(modelListBuff));
            //console.log("bxmlData");
            //console.log(bxmlData);

            //let bfresName = bxmlData.UnitName;
            //if(bfresName == null)return null;

            //return this._loadActorModel(name, bfresName);
        }else{
            console.warn("Actor-Pack not found for: " + name);
        }
*/
        return info;

    }

    /**
     * tries to find and load bfres files that belong to an actor
     * @param {string} bfresName 
     * @returns {BFRES_Container}
     */
    async _getActorBfresFiles(bfresName)
    {
        const files = new BFRES_Container();

        // check if a normal file exists
        const bfresMainPath = path.join(this.modelsPath, `${bfresName}.sbfres`);

        if(this.bfresFiles[bfresMainPath] || fs.existsSync(bfresMainPath))
        {
            files.add(await this._getSingleActorBfresFile(bfresMainPath));
        }else{
            // check until no more sub-files are found
            for(let i=0;;++i)
            {
                const bfresNum = i.toString().padStart(2, "0");
                const bfresSubPath = path.join(this.modelsPath, `${bfresName}-${bfresNum}.sbfres`);
                if(this.bfresFiles[bfresSubPath] || fs.existsSync(bfresSubPath)) 
                {
                    files.add(await this._getSingleActorBfresFile(bfresSubPath));
                }else{
                    break;
                }
            }
        }
        return files;
    }

    async _getSingleActorBfresFile(bfresPath)
    {
        if(!this.bfresFiles[bfresPath])
        {
            const bfresParser = new BFRES_Parser(true);
            bfresParser.loader = this.loader;

            let bfresPathNoExt = bfresPath.substr(0, bfresPath.length - "sbfres".length);
            if(bfresPathNoExt.substr(-4, 1) == "-") // this happens when multiple bfres files share one/two texture files
            {
                bfresPathNoExt = bfresPathNoExt.substr(0, bfresPathNoExt.length - 4) + ".";
            }
            
            const texturePath = bfresPathNoExt + "Tex1.sbfres"; // @TODO also handle ".1.bfres" files.... fucking stupid

            if(fs.existsSync(texturePath))
            {
                const texBuffer = this.fileLoader.buffer(texturePath);
                const textureParser = new BFRES_Parser(true);
                textureParser.loader = this.loader;

                if(await textureParser.parse(texBuffer))
                {
                    bfresParser.setTextureParser(textureParser);
                }
            }

            if(await bfresParser.parse(this.fileLoader.buffer(bfresPath)))
                this.bfresFiles[bfresPath] = bfresParser;
        }

        return this.bfresFiles[bfresPath];
    }
};
