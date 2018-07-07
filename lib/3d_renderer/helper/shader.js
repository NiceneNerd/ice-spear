/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Base = require("./base.js");

module.exports = class Renderer_Helper_Shader extends Base
{
    constructor(threeContext)
    {
        super(threeContext);

        this.shaders = {};
    }

    
    async getShader(name)
    {
        if(!this.shaders[name])
        {
            this.shaders[name] = await this._loadShader(name);
        }
        return this.shaders[name];
    }

    async _loadShader(name)
    {
        
    }
}