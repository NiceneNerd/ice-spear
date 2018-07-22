/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const path = require('path');
const fs = require('fs-extra');

const PicoGL = require("picogl");

module.exports = class Marker
{
    constructor(engine)
    {
        this.engine = engine;
        this.glApp = this.engine.getApp();

        this.pos = new Float32Array([0.0, 0.0]);
        this.radius = 0.016;
    }

    setPos(x, y)
    {
        this.pos[0] = x;
        this.pos[1] = y;
        this.drawCall.uniform("uObjectPos", this.pos);
    }

    getPos()
    {
        return this.pos;
    }

    async createDrawCall()
    {    
        const posBuffer = this.glApp.createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
            -this.radius, -this.radius,  this.radius, -this.radius,
             this.radius,  this.radius, -this.radius,  this.radius,
        ]));

        const uvBuffer = this.glApp.createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
            0.0, 0.0, 1.0, 0.0, 
            1.0, 1.0, 0.0, 1.0
        ]));

        const idxBuffer = this.glApp.createIndexBuffer(PicoGL.UNSIGNED_INT, 3, new Uint32Array([0, 1, 2, 2, 3, 0]));

        const iconVertexArray = this.glApp.createVertexArray()
            .indexBuffer(idxBuffer)
            .vertexAttributeBuffer(0, posBuffer)
            .vertexAttributeBuffer(1, uvBuffer);
        ;

        this.iconShrineBuffer = await fs.readFile(path.join(__BASE_PATH, "assets", "img", "map", "marker.bin"));
        const iconShrineTexture =  this.engine.createTexture(this.iconShrineBuffer, {x: 128, y:128}, {
            wrapS: PicoGL.CLAMP_TO_EDGE,
            wrapT: PicoGL.CLAMP_TO_EDGE,
            flipY: true
        });

        this.drawCall = this.engine.createDrawCall("marker", iconVertexArray, true)
            .texture("texColor", iconShrineTexture)
            .uniform("uObjectPos", this.pos)
            .uniformBlock("globalUniforms", this.engine.getGlobalUniform());

        return this.drawCall;
    }

}