/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require("fs-extra");
const path = require("path");

module.exports = class Layout_Save
{
    constructor(saveDirectory)
    {
        this.saveDirectory = saveDirectory;
    }

    _getSaveFilePath(logicName)
    {
        return path.join(this.saveDirectory, `${logicName}.logic.json`);
    }

    async save(cy, logicName)
    {
        const saveData = {
            nodes: {}
        };

        cy.nodes().forEach(actor => 
        {
            saveData.nodes[actor.data("id")] = {
                pos: actor.position()
            };
        });

        await fs.writeJSON(this._getSaveFilePath(logicName), saveData);
    }

    async load(logicName)
    {
        try{
            return await fs.readJSON(this._getSaveFilePath(logicName));
        }catch(e){}

        return {};
    }
};