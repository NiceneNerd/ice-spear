/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Base = require("./base.js");

module.exports = class Renderer_Helper_Texture extends Base
{
    createTexture(buffer, sizeX, sizeY)
    {
        let texture = new this.THREE.DataTexture(buffer, sizeX, sizeY, this.THREE.RGBAFormat);

        texture.wrapS = this.THREE.RepeatWrapping; // @TODO read from FTEX/GX surface
        texture.wrapT = this.THREE.RepeatWrapping;

        texture.magFilter = this.THREE.LinearFilter; // @TODO read from FTEX/GX surface
        texture.minFilter = this.THREE.LinearFilter;

        return texture;
    }
};
