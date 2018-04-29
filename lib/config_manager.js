/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const os = require('os');
const fs = require("fs");
const path = require('path');

module.exports = class Config_Manager
{
    constructor()
    {
        this.CONFIG_NAME     = "config.json";
        this.CONFIG_DEF_NAME = "config.default.json";

        this.load();
    }

    load()
    {
        if(fs.existsSync(__BASE_PATH + this.CONFIG_NAME))
        {
            this.config = requireGlobal("./" + this.CONFIG_NAME);
        }else{
            this.config = requireGlobal("./" + this.CONFIG_DEF_NAME);
            this.config.projects.path = path.join(os.homedir(), 'ice-spear');
            this.save();
        }
    }

    save()
    {
        fs.writeFileSync(__BASE_PATH + this.CONFIG_NAME, 
            JSON.stringify(this.config, null, 4)
        );
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

    setValue(name, value)
    {
        let parts = name.split(".");
        let lastPart = parts.pop();

        let ref = this.config;
        for(let part of parts)
        {
            if(ref[part] === null)
                return null;

            ref = ref[part];
        }

        ref[lastPart] = value;
    }
};