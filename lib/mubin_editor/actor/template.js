/**
* @copyright 2019 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const templateCache = {};
const CONFIG_DIR    = path.join(os.homedir(), ".ice-spear");
const userTemplateDir = path.join(CONFIG_DIR, '/templates');

module.exports = class Actor_Templates
{
    static async getHtmlSelect(params)
    {
        const list = await Actor_Templates.getList();
        return list.map(entry => `<option value='${entry.id}'>${entry.name}</option>`).join("\n");
    }

    static async getList(params)
    {
        let files = await fs.readdir(path.join(__dirname, 'templates'));

        try{    
            files = files.concat(await fs.readdir(userTemplateDir));
        } catch(e) {
            console.info(`No user templates found in '${userTemplateDir}'.`);
        }
        
        const list = [];
        for(let file of files) 
        {
            const id = file.split('.')[0];
            const data = await Actor_Templates.getData(id);
            list.push({id, name: data.name});
        }
        return list;
    }

    static async getData(name)
    {
        if(!templateCache[name]) {
            try {
            templateCache[name] = await fs.readJSON(path.join(__dirname, 'templates', `${name}.json`));
            } catch(e) {
                templateCache[name] = await fs.readJSON(path.join(userTemplateDir, `${name}.json`));
            }
        }
        return templateCache[name];
    }
}