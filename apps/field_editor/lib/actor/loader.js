/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs    = require('fs-extra');
const path  = require('path');
const BYAML = require("byaml-lib");
const Binary_File_Loader = require("binary-file").Loader;

/**
 * Class to load actors in a shrine and give them to the correct handler classes
 */
module.exports = class Actor_Loader
{
    /**
     * loads actors into the handler
     * @param {Actor_Handler} actorHandler 
     */
    constructor(actorHandler)
    {
        this.actorHandler = actorHandler;        
        this.fileLoader = new Binary_File_Loader();
    }

    /**
     * loads dynamic and static actors from a shrine
     * and adds them to the actor handler
     * @param {string} shrineDir shrine base directory
     * @param {string} shrineName shrine name
     */
    async load(shrineDir, shrineName)
    {
        this.actorHandler.dataActorDyn = await this._loadActors("Dynamic", shrineDir, shrineName);
        this.actorHandler.dataActorStatic = await this._loadActors("Static", shrineDir, shrineName);

        const { dataActorDyn, dataActorStatic } = this.actorHandler;

        if(dataActorDyn != null && dataActorDyn.Objs != null)
            await this._addAllActors(dataActorDyn.Objs, "Dynamic");

        if(dataActorStatic != null && dataActorStatic.Objs != null)
            await this._addAllActors(dataActorStatic.Objs, "Static");
    }

    /**
     * loads dynamic or static actors from the shrine actor BYAML files
     * @param {string} typeName "Dynamic" or "Static"
     * @param {string} shrineDir shrine base directory
     * @param {string} shrineName shrine name
     * @returns undefined or an object with the parsed BYAML
     */
    async _loadActors(typeName, shrineDir, shrineName)
    {
        const fileActors = path.join(shrineDir, "Map", "CDungeon", shrineName, `${shrineName}_${typeName}.smubin`);
        if(fs.existsSync(fileActors))
        {
            const byaml = new BYAML.Parser();
            return byaml.parse(this.fileLoader.buffer(fileActors));
        }

        return undefined;
    }

    /**
     * adds all actors to the actor handler
     * @param {Object} actorObjectArray 
     * @param {string} type
     */
    async _addAllActors(actorObjectArray, type)
    {
        for(let params of actorObjectArray)
        {
            const name = params.UnitConfigName.value;
            await this.actorHandler.addActor(name, params, type, false);
        }
    }
}