/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require("fs-extra");
const path = require("path");

const NUM_TEXTURES = 12;

let shaderCache = undefined;

async function loadShader()
{
    const shaderPath = path.join(__BASE_PATH, "lib", "terrain", "mesh", "shader");

    const vertexShader   = await fs.readFile(path.join(shaderPath, "vertex.glsl.vert"),   'utf8');
    const fragmentShader = await fs.readFile(path.join(shaderPath, "fragment.glsl.frag"), 'utf8');

    shaderCache = new THREE.ShaderMaterial({uniforms: {}, vertexShader, fragmentShader});

    return shaderCache;
}

module.exports = async (textures = []) => 
{
    const shader = (shaderCache || await loadShader()).clone();

    const uniforms = {};
    for(let i in textures)
    {
        if(i >= NUM_TEXTURES)break;

        shader.uniforms["tex" + i.toString().padStart(2, "0")] = {
            type: "t", 
            value: textures[i]
        };
    }

    return shader;
};