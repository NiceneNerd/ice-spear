/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs');

const Config_Manager = requireGlobal("./lib/config_manager.js");
const Binary_File_Loader = requireGlobal('./lib/binary_file/file_loader.js');
const BYAML = requireGlobal("lib/byaml/byaml.js");


module.exports = class Actor_Handler
{
    constructor()
    {
        this.fileLoader = new Binary_File_Loader();

        let cfg = new Config_Manager();
        this.actorPath = cfg.getValue("game.path") + "/content/Actor/";

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
        let actorData = byaml.parse(this.fileLoader.buffer(this.actorPath + "ActorInfo.product.sbyml"));
        
        if(this.loader)await this.loader.setInfo("Converting Data");

        for(let actor of actorData.Actors)
        {
            this.actorInfo[actor.name] = actor;
        }

        //console.log(this.actorInfo.DgnObj_IvyBurn);
        //console.log(this.actorInfo.DgnMrgPrt_Dungeon000);
    }
};

/*
        let sarc = new SARC();
        let actorFiles = sarc.parse("DgnObj_IvyBurn.sbactorpack");
        console.log(actorFiles);

        let actorModelList = sarc.getFile("Actor/ModelList/DgnObj_IvyBurn.bmodellist");
        console.log(actorModelList);
*/