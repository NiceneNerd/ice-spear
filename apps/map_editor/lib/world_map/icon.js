/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const path = require('path');
const fs = require('fs-extra');

const PicoGL = require("picogl");

module.exports = class Icon
{
    constructor(engine)
    {
        this.engine = engine;
        this.glApp = this.engine.getApp();
    }
    async createDrawCall(locations)
    {
        this.iconShrineBuffer = await fs.readFile(path.join(__BASE_PATH, "assets", "img", "map", "shrine.bin"));
    
        const posBuffer = this.glApp.createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
            -1.0, -1.0,  1.0, -1.0,
            1.0,  1.0, -1.0,  1.0,
        ]));

        const uvBuffer = this.glApp.createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
            0.0, 0.0, 1.0, 0.0,
            1.0, 1.0, 0.0, 1.0,
        ]));

        const iconPosScale = 1.0 / 1000.0;
        const instPosBuffer = new Float32Array(locations.length * 2);
        let instPosBufferPos = 0;
        for(let entry of locations)
        {
            if(entry.Icon && entry.Icon.value == "Dungeon")
            {               
                instPosBuffer[instPosBufferPos++] = entry.Translate.X.value * iconPosScale;
                instPosBuffer[instPosBufferPos++] = entry.Translate.Z.value * -iconPosScale;
            }
        }

        const instanceBuffer = this.glApp.createVertexBuffer(PicoGL.FLOAT, 2, instPosBuffer);

        const idxBuffer = this.glApp.createIndexBuffer(PicoGL.UNSIGNED_INT, 3, new Uint32Array([0, 1, 2, 2, 3, 0]));

        const iconVertexArray = this.glApp.createVertexArray()
            .indexBuffer(idxBuffer)
            .vertexAttributeBuffer(0, posBuffer)
            .vertexAttributeBuffer(1, uvBuffer)
            .instanceAttributeBuffer(2, instanceBuffer);

        const iconShrineTexture =  this.engine.createTexture(this.iconShrineBuffer, {x: 128, y:128}, {
            wrapS: PicoGL.CLAMP_TO_EDGE,
            wrapT: PicoGL.CLAMP_TO_EDGE,
            flipY: true
        });

        return this.engine.createDrawCall("icon", iconVertexArray, true)
            .texture("texColor", iconShrineTexture)
            .uniformBlock("globalUniforms", this.engine.getGlobalUniform());
    }
}