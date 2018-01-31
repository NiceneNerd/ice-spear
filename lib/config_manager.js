/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = class Config_Manager
{
    constructor()
    {
        this.config = requireGlobal("./config.json");
    }

    getConfig()
    {
        return this.config;
    }

    getValue(name)
    {
        let parts = name.split(".");
        let ref = this.config;
        for(let part of parts)
        {
            if(ref[part] === null)
                return null;

            ref = ref[part];
        }

        return ref;
    }
};