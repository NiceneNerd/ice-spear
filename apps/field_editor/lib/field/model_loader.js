/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs   = require('fs-extra');
const path = require('path');

const Binary_File_Loader = require("binary-file").Loader;

/**
 * Class to load the shrine model and its textures
 */
module.exports = class Field_Model_Loader
{
    constructor()
    {
        this.fileLoader = new Binary_File_Loader();
    }

    /**
     * loads the shrine BFRES model, also tries to load the texture file
     * @param {string} fieldPath shrine base directory
     * @param {string} fieldSection shrine name
     * @returns {BFRES_Parser|undefined} the main model parser
     */
    async load(fieldPath, fieldSection)
    {
        console.log(fieldPath);
        console.log(fieldSection);
        return undefined;
    }
}