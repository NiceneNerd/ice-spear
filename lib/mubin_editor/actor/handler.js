/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs');
const uuid = require("uuid/v4");
const path = require("path");

const BYAML = require("byaml-lib");
const Main_Config  = requireGlobal("./lib/config/main_config");

const Actor        = require('./actor');
const Actor_Params = require('./params');
const Actor_Cache  = require('./cache/cache');

const Actor_Object_Loader = require('./object/loader');
const Actor_Object_Handler = require('./object/handler');

module.exports = class Actor_Handler
{
    /**
     * @param {Shrine_Renderer} mubinRenderer 
     * @param {Loader} loader 
     * @param {String_Table} stringTable 
     */
    constructor(mubinRenderer, project, loader, stringTable = null)
    {
        this.mubinRenderer = mubinRenderer;
        this.loader = loader;
        this.stringTable = stringTable;
        this.actorEditor = undefined;

        this.actors = {};
        this.dataActorDyn    = {};
        this.dataActorStatic = {};
        this.dataActorProd   = [];

        const actorCache = new Actor_Cache(
            project.getCachePath(),
            project.mainConfig.getValue("cache.actors")
        );

        const cfg = new Main_Config();
        const actorPath  = cfg.getValue("game.path") + "/content/Actor";
        const modelsPath = cfg.getValue("game.path") + "/content/Model";

        const actorObjLoader = new Actor_Object_Loader(actorPath, modelsPath, actorCache, this.mubinRenderer, this.loader, this.stringTable);
        this.actorObjHandler = new Actor_Object_Handler(actorObjLoader, this.mubinRenderer);
    }

    async init()
    {
        await this.actorObjHandler.init();
    }

    update()
    {
        this.actorObjHandler.update();
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
        const actorObjInstance = await this.actorObjHandler.createInstance(name);
        if(!actorObjInstance)
            return undefined;

        Actor_Params.normalize(params);

        const actor = new Actor(params, type, uuid(), actorObjInstance);
        actor.setHandler(this);

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
        actor.update();

        return actor;
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
        this.mubinRenderer.deleteActor(actor);

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
        this.mubinRenderer.deleteActor(actor);
        this.mubinRenderer.addActor(actor);
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
};
