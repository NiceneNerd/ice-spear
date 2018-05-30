/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs');

const Main_Config        = requireGlobal("./lib/config/main_config.js");
const Binary_File_Loader = require("binary-file").Loader;
const BFRES_Parser       = requireGlobal('lib/bfres/parser.js');

const Actor_Object = require('./actor_object.js');
const Actor        = require('./actor.js');

const BYAML = require("byaml-lib").Parser;
const BXML  = requireGlobal("lib/bxml/bxml.js");
const SARC  = require("sarc-lib");

module.exports = class Actor_Handler
{
    constructor(shrineRenderer, stringTable = null)
    {
        this.shrineRenderer = shrineRenderer;
        this.stringTable = stringTable;

        this.fileLoader = new Binary_File_Loader();

        let cfg = new Main_Config();
        this.actorPath  = cfg.getValue("game.path") + "/content/Actor";
        this.modelsPath = cfg.getValue("game.path") + "/content/Model";

        this.clear();
    }

    clear()
    {
        this.actors = {};
        this.actorInfo = {};

        this.objects = {};
        this.objects.DUMMY_BOX = new Actor_Object(this.shrineRenderer);
    }

    async loadActorDatabase()
    {
        if(this.loader)
        {
            await this.loader.setStatus("Loading Actor Database");
            await this.loader.setInfo("Parsing File");
        }

        let byaml = new BYAML();
        this.actorData = byaml.parse(this.fileLoader.buffer(this.actorPath + "/ActorInfo.product.sbyml"));

        if(this.loader)await this.loader.setInfo("Converting Data");

        for(let actor of this.actorData.Actors)
        {
            this.actorInfo[actor.name.value] = actor;
        }
    }

    async addActor(name, {Translate = null, Rotate = null, ...params})
    {
        let actorObject = await this._getActorObject(name) || await this._getActorObject("DUMMY_BOX");
        const actor = new Actor(name, actorObject.createInstance());

        if(Translate != null)
            actor.pos.fromArray(BYAML.toRawValues(Translate));

        if(Rotate != null)
        {
            if(Rotate.length == null)
            {
                actor.rot.y = Rotate.value;
            }else{
                actor.rot.fromArray(BYAML.toRawValues(Rotate));
            }
        }

        console.log(actor);
        actor.update();

        this.actors[name] = actor; // TODO get uuid
        return actor;
    }

    async _getActorObject(name)
    {
        if(!this.objects[name])
        {
            let actorInfo = await this._getActorData(name);
            if(!actorInfo)
            {
                console.warn(`Actor_Handler._getActorData for ${name} returned nothing!`);
                return undefined;
            }

            if(!actorInfo.bfresParser)
            {
                console.warn(`Actor_Handler._getActorData for ${name} returned no bfresParser!`);
                return undefined;
            }

            this.objects[name] = new Actor_Object(this.shrineRenderer, actorInfo.bfresParser.getModels());
        }

        return this.objects[name];
    }

    async _getActorData(name)
    {
        const info = this.actorInfo[name];
        if(info == null)
            return null;
        
        if(info.bfresParser == null)
        {            
            if(info.bfres != null)
            {
                const bfresName = info.bfres.value;
                const bfresPath = this.modelsPath + "/" + bfresName + ".sbfres";
        
                if(fs.existsSync(bfresPath))
                {
                    const bfresParser = new BFRES_Parser(true);
                    bfresParser.loader = this.loader;
        
                    const texturePath = this.modelsPath + "/" + bfresName + ".Tex1.sbfres";
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
                    info.bfresParser = bfresParser;
                }
        
                return null;
                //console.log(info.bfresParser);
            }else{
                console.warn("Actor is missing the BFRES setting: " + name);
            }
        }

        return info;

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
            
            let bfresName = bxmlData.UnitName;
            if(bfresName == null)return null;

            return this._loadActorModel(name, bfresName);
        }else{
            console.warn("Actor-Pack not found for: " + name);
        }
        */
    }

/*
    getInfoByHash(hash)
    {
        let numActors = this.actorData.Hashes.length;
        for(let i=0; i<numActors; ++i)
        {
            if(hash == this.actorData.Hashes[i].value)
                return this.actorData.Actors[i];
        }
        return null;
    }
    */
};
