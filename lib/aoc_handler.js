/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const path = require("path");
const fs = require("fs-extra");

const SARC = require("sarc-lib");
const yaz0 = require("yaz0-lib");

module.exports = class AocMainField_Handler
{
    constructor(gamePath, projectPath)
    {
        this.gamePath = gamePath;
        this.projectPath = projectPath;

        this.aocPackPath = path.join(this.projectPath, "AocMainField.unpacked");
        this.mainFieldPath = path.join(this.aocPackPath, "Map", "MainField");
    }

    async extract()
    {
        if(!await fs.exists(this.aocPackPath))
        {
            const aocPackGamePath = path.join(this.gamePath, "content", "0010", "Pack", "AocMainField.pack");
            const sarc = new SARC();
            sarc.parse(aocPackGamePath);
            await sarc.extractFiles(this.aocPackPath);
        }
    }

    async pack()
    {
        const sarc = new SARC();
        await sarc.fromDirectory(this.aocPackPath);
        const sarcBuffer = sarc.create();
        await fs.writeFile(this.aocPackPath.replace(".unpacked", ".pack"), sarcBuffer);
    }

    getStaticFieldMubin(fieldSection)
    {
        return path.join(this.mainFieldPath, fieldSection, fieldSection + "_Static.smubin");
    }
};