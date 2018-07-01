/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const path = require("path");

const Binary_File = require("binary-file");
const BFRES_Parser = require('./../../bfres/parser');

module.exports = async (gamePath) =>
{
    const terrainTexPath = path.join(gamePath, "content", "Model", "Terrain.Tex1.sbfres");
    const bfresBuffer = (new Binary_File.Loader()).buffer(terrainTexPath);

    const parser = new BFRES_Parser(true);
    parser.loader = this.loader;

    console.time("TerrainTex");
    if(await parser.parse(bfresBuffer))
    {
        console.log(parser);
    }
    console.timeEnd("TerrainTex");

    const textures = [];
    const ftexSurface = parser.getTextureByName("MaterialAlb").surface;

    console.time("TerrainTexGL");

    for(let imageBuffer of ftexSurface.imageBuffers)
    {
        const tex = new THREE.DataTexture(imageBuffer, ftexSurface.sizeX, ftexSurface.sizeY, THREE.RGBAFormat);

        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;

        tex.magFilter = THREE.LinearFilter;
        tex.minFilter = THREE.LinearFilter;

        tex.needsUpdate = true;

        textures.push(tex);
    }

    console.timeEnd("TerrainTexGL");

    return textures;
};