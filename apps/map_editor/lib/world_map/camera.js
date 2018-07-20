/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const PicoGL = require("picogl");

const UNIFORM_INDEX_POS   = 0;
const UNIFORM_INDEX_SCALE = 1;

const moveScale = 0.0002;

const scaleLimitMin = 0.075;
const scaleLimitMax = 42.0;

const velocityMinVal = 0.00001;
const velocityReduce = 0.85; // 0.75;

module.exports = class Camera
{
    constructor(engine)
    {
        this.engine = engine;

        this.camPosBuffer   = new Float32Array([0.0, 0.0]);
        this.camScaleBuffer = new Float32Array([0.125, 0.125]);
        this.camVelocity = [0.0, 0.0];

        this.cameraUniform = this.engine.createUniformBuffer([this.camPosBuffer, this.camScaleBuffer]);
    }

    getUniformBuffer()
    {
        return this.cameraUniform;
    }

    onScroll(ev) 
    {
        let scaleMulti = ev.deltaY < 0.0 ? 1.0 : -1.0;
        scaleMulti = (scaleMulti * 0.1) + 1.0;

        this.camScaleBuffer[0] *= scaleMulti;
        this.camScaleBuffer[1] *= scaleMulti;

        if(this.camScaleBuffer[0] < scaleLimitMin)this.camScaleBuffer[0] = scaleLimitMin;
        if(this.camScaleBuffer[1] < scaleLimitMin)this.camScaleBuffer[1] = scaleLimitMin;

        if(this.camScaleBuffer[0] > scaleLimitMax)this.camScaleBuffer[0] = scaleLimitMax;
        if(this.camScaleBuffer[1] > scaleLimitMax)this.camScaleBuffer[1] = scaleLimitMax;

        this.cameraUniform.set(UNIFORM_INDEX_SCALE, this.camScaleBuffer).update();
    }

    onMove(ev)
    {
        if(ev.which == 0)return;

        const addCamVelocity = [
            ev.movementX *  moveScale,
            ev.movementY * -moveScale
        ];

        this.camVelocity[0] += addCamVelocity[0] / this.camScaleBuffer[0];
        this.camVelocity[1] += addCamVelocity[1] / this.camScaleBuffer[1];
    }

    update()
    {
        if(Math.abs(this.camVelocity[0]) > velocityMinVal || Math.abs(this.camVelocity[1]) > velocityMinVal)
        {
            this.camVelocity[0] *= velocityReduce;
            this.camVelocity[1] *= velocityReduce;

            this.camPosBuffer[0] += this.camVelocity[0];
            this.camPosBuffer[1] += this.camVelocity[1];

            this.cameraUniform.set(UNIFORM_INDEX_POS, this.camPosBuffer).update();
        }
    }
};