/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const PicoGL = require("picogl");

module.exports = (glApp, mapTilesX, mapTilesY) =>
{
    const mapTileOffsetX = ((mapTilesX-1) / 2.0);
    const mapTileOffsetY = ((mapTilesY-1) / 2.0);

    const positions = glApp.createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
         -0.5, -0.5,  0.5, -0.5,
         0.5,  0.5, -0.5,  0.5,
    ]));

    const idxBuffer = glApp.createIndexBuffer(PicoGL.UNSIGNED_INT, 3, new Uint32Array([
        0, 1, 2, 2, 3, 0
    ]));

    const instancedPosBuff = new Float32Array(mapTilesX * mapTilesY * 2);
    let buffPos = 0;
    for(let y=0; y<mapTilesY; ++y) 
    {
        for(let x=0; x<mapTilesX; ++x)
        {
            instancedPosBuff[buffPos++] = x - mapTileOffsetX;
            instancedPosBuff[buffPos++] = y - mapTileOffsetY;
        }
    }

    const instancedPos = glApp.createVertexBuffer(PicoGL.FLOAT, 2, instancedPosBuff);

    return glApp.createVertexArray()
        .indexBuffer(idxBuffer)
        .vertexAttributeBuffer(0, positions)
        .instanceAttributeBuffer(1, instancedPos);
}