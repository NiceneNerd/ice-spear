/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs');

const Config_Manager     = requireGlobal("./lib/config_manager.js");
const Binary_File_Loader = require("binary-file").Loader;
const BFRES_Parser       = requireGlobal('lib/bfres/parser.js');

const BYAML = require("byaml-lib").Parser;
const BXML  = requireGlobal("lib/bxml/bxml.js");
const SARC  = require("sarc-lib");

module.exports = class Actor_Handler
{
    constructor(stringTable = null)
    {
        this.fileLoader = new Binary_File_Loader();
        this.stringTable = stringTable;

        let cfg = new Config_Manager();
        this.actorPath  = cfg.getValue("game.path") + "/content/Actor";
        this.modelsPath = cfg.getValue("game.path") + "/content/Model";

        this.clear();
    }

    clear()
    {
        this.actorInfo = {};
    }

    async load()
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

    async getActorData(name)
    {
        let info = this.getInfo(name);
        if(info == null)
            return null;
        
        if(info.bfresParser == null)
        {            
            if(info.bfres != null)
            {
                info.bfresParser = await this._loadActorModel(name, info.bfres.value);
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

        return null;
    }

    async _loadActorModel(actorName, bfresName)
    {
        let bfresPath = this.modelsPath + "/" + bfresName + ".sbfres";
        
        if(fs.existsSync(bfresPath))
        {
            let bfresParser = new BFRES_Parser(true);
            bfresParser.loader = this.loader;

            let texturePath = this.modelsPath + "/" + bfresName + ".Tex1.sbfres";
            if(fs.existsSync(texturePath))
            {
                let texBuffer = this.fileLoader.buffer(texturePath);

                let textureParser = new BFRES_Parser(true);
                textureParser.loader = this.loader;
                if(await textureParser.parse(texBuffer))
                {
                    bfresParser.setTextureParser(textureParser);
                }
            }

            if(await bfresParser.parse(this.fileLoader.buffer(bfresPath)))
                return bfresParser;
        }

        return null;
    }

    getInfo(name)
    {
        return this.actorInfo[name];
    }

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
};
