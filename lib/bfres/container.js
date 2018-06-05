/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = class BFRES_Container
{
    constructor()
    {
        this.files = [];
    }

    add(file)
    {
        this.files.push(file);
    }

    isEmpty()
    {
        return this.files.length == 0;
    }

    getModels()
    {
        const models = {};
        for(const file of this.files)
        {
            Object.assign(models, file.getModels());
        }
        return models;
    }
}