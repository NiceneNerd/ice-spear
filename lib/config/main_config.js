/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const os = require('os');
const fs = require("fs");
const path = require('path');

const Config_Manager = require("./manager.js");

const CONFIG_NAME     = "config.json";
const CONFIG_DEF_NAME = "config.default.json";

module.exports = class Main_Config extends Config_Manager
{
    constructor()
    {
        super();
        this.load();
    }

    load()
    {
        if(!super.load(path.join(__BASE_PATH, CONFIG_NAME)))
        {
            fs.copyFileSync(
                path.join(__BASE_PATH, CONFIG_DEF_NAME),
                path.join(__BASE_PATH, CONFIG_NAME)
            );

            super.load(path.join(__BASE_PATH, CONFIG_NAME));
            this.setValue("projects.path", path.join(os.homedir(), ".ice-spear-projects"));
            this.save();
        }
    }
};