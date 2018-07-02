/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const path = require("path");

const Binary_File = require("binary-file");
const BFRES_Parser = require('./../../bfres/parser');
const fs = require("fs-extra");

const TEXTURE_WITH = 1024;
const TEXTURE_HEIGHT = 1024;
const TEXTURE_SIZE = TEXTURE_WITH * TEXTURE_HEIGHT * 4;
const NUM_TEXTURES = 83;

/**
 * loads the textures directly from the bfres files
 * @param {string} terrainTexPath 
 * @param {Array<Buffer>} array of texture buffers
 */
async function loadTextureFromBfres(terrainTexPath)
{
    const bfresBuffer = (new Binary_File.Loader()).buffer(terrainTexPath);
    const parser = new BFRES_Parser(true);
    await parser.parse(bfresBuffer);

    const ftexSurface = parser.getTextureByName("MaterialAlb").surface;
    return ftexSurface.imageBuffers;
}

/**
 * writes all texture into one single file (always 332MB)
 * @param {string} imageBuffers 
 * @param {string} textureCachePath 
 */
async function generateCache(imageBuffers, textureCachePath)
{
    for(let imageBuffer of imageBuffers)
    {
        await fs.appendFile(textureCachePath, imageBuffer);
    }
}

/**
 * loads all textures from the cache file
 * @param {string} textureCachePath 
 * @param {Array<Buffer>} array of texture buffers
 */
async function loadFromCache(textureCachePath)
{
    const cacheBuffer = await fs.readFile(textureCachePath);
    const imageBuffers = new Array(NUM_TEXTURES);
    for(let i=0; i<NUM_TEXTURES; ++i)
    {
        imageBuffers[i] = cacheBuffer.slice(i * TEXTURE_SIZE, (i+1) * TEXTURE_SIZE);
    }
    return imageBuffers;
}

/**
 * creates an actual OpenGL/THREE.js texture from the buffer
 * @param {Buffer} imageBuffer 
 * @returns {Object} THREE.js texture
 */
function createTexture(imageBuffer)
{
    const tex = new THREE.DataTexture(imageBuffer, TEXTURE_WITH, TEXTURE_HEIGHT, THREE.RGBAFormat);

    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;

    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;

    tex.needsUpdate = true;

    return tex;
}

/**
 * loads the terrain-texture files from the bfres file or from cache (if enabled)
 * @param {string} gamePath 
 * @param {string} cachePath if no path is provided, cache is disabled
 * @returns {Array<Object>} array of THREE.js textures
 */
module.exports = async (gamePath, cachePath = "") =>
{
    const cacheEnabled = !!cachePath;
    const textureCachePath = path.join(cachePath, "terrain_textures.bin");

    let imageBuffers;
    if(cacheEnabled && await fs.exists(textureCachePath))
    {
        imageBuffers = await loadFromCache(textureCachePath);
    }else{
        const terrainTexPath = path.join(gamePath, "content", "Model", "Terrain.Tex1.sbfres");
        imageBuffers = await loadTextureFromBfres(terrainTexPath);

        if(cacheEnabled)
        {
            await generateCache(imageBuffers, textureCachePath);
        }
    }

    const textures = [];

    for(let imageBuffer of imageBuffers)
        textures.push(createTexture(imageBuffer));

    return textures;
};