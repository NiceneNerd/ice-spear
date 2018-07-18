/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const electron = require('electron');
const fs       = require('fs-extra');
const path     = require('path');
const url      = require('url');
const Notify   = requireGlobal("lib/notify/notify.js");
const App_Base = requireGlobal("./apps/base.js");

const Binary_File_Loader = require("binary-file").Loader;
const BFRES_Parser       = require('./../../lib/bfres/parser');

const PicoGL = require("picogl");
const NanoTimer = require('nanotimer');

const NUM_TO_LETTER = ["Z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

module.exports = class App extends App_Base
{
    constructor(window, args)
    {
        super(window, args);

        this.drawCall = null;
        this.glApp = null;

        this.camPosBuffer   = new Float32Array([0.0, 0.0]);
        this.camScaleBuffer = new Float32Array([0.125, 0.125]);
        this.aspectRatio    = new Float32Array([1.0, 1.0]);

        this.fileLoader = new Binary_File_Loader();

        this.camVelocity = [0.0, 0.0];
    }

    async _loadMapTexture(texPath, textureName)
    {
        let buffer = this.fileLoader.buffer(texPath);
        const bfresTexParser = new BFRES_Parser(true);

        bfresTexParser.setLoader(this.loader);

        if(await bfresTexParser.parse(buffer))
        {
            const bfresTex = bfresTexParser.getTextureByName(textureName);
            if(bfresTex && bfresTex.surface && bfresTex.surface.imageBuffer)
            {
                return bfresTex.surface.imageBuffer;
            }
        }
        return undefined;
    }

    async run()
    {
        await super.run();

        const imgTestCache = "C:/Users/Max/.ice-spear-projects/test/cache/terrain_textures.bin";
        //const imageBuffer = await fs.readFile(imgTestCache);

    // CONSTNATS
        const mapTilesX = 12;
        const mapTilesY = 10;
        const mapTileOffsetX = ((mapTilesX-1) / 2.0);
        const mapTileOffsetY = ((mapTilesY-1) / 2.0);

        const detailLevel = "1";
        const detailDimension = {
            "0": 2000,
            "1": 560
        };
        const texBasePath = path.join(this.config.getValue("game.path"), "content", "UI", "MapTex", "MainField");

    // TEXTURES
        const singleImageSize =  detailDimension[detailLevel] * detailDimension[detailLevel] * 3;
        const imageBuffer = Buffer.alloc(mapTilesX * mapTilesY * singleImageSize);
        let imageBuffPos = 0;

        this.loader.show();

        for(let y=0; y<mapTilesY; ++y) 
        {
            for(let x=0; x<mapTilesX; ++x)
            {
                const sectionName = NUM_TO_LETTER[x] + "-" + (mapTilesY - y - 1);
                const textureName = `MapTex${detailLevel == "0" ? "" : detailLevel}_${sectionName}`;
                const texPath = path.join(texBasePath, textureName + ".sbmaptex");
        
                const mapSectionBuff = await this._loadMapTexture(texPath, textureName);
                if(mapSectionBuff)
                {
                    mapSectionBuff.copy(imageBuffer, imageBuffPos);
                }       

                imageBuffPos += singleImageSize;
            }
        }
        this.loader.hide();


    // READ SHADER-CODE
        const shaderPath = path.join(__BASE_PATH, "apps", "map_editor", "lib", "shader");
        const vertexShaderSource = await fs.readFile(path.join(shaderPath, "map.glsl.vert"), 'utf8')
        const fragmentShaderSource = await fs.readFile(path.join(shaderPath, "map.glsl.frag"), 'utf8')

    // HTML/JS EVENTS
        document.onwheel = ev => {
            const scaleLimitMin = 0.075;

            let scaleMulti = ev.deltaY < 0.0 ? 1.0 : -1.0;
            scaleMulti = (scaleMulti * 0.1) + 1.0;

            this.camScaleBuffer[0] *= scaleMulti;
            this.camScaleBuffer[1] *= scaleMulti;

            if(this.camScaleBuffer[0] < scaleLimitMin)this.camScaleBuffer[0] = scaleLimitMin;
            if(this.camScaleBuffer[1] < scaleLimitMin)this.camScaleBuffer[1] = scaleLimitMin;

            this.uniformBuffer.set(1, this.camScaleBuffer).update();
        };

        document.onmousemove = ev => {
            if(ev.which == 0)return;

            const moveScale = 0.0002;

            const addCamVelocity = [
                ev.movementX *  moveScale,
                ev.movementY * -moveScale
            ];

            this.camVelocity[0] += addCamVelocity[0] / this.camScaleBuffer[0];
            this.camVelocity[1] += addCamVelocity[1] / this.camScaleBuffer[1];
        };

    // GL PROGRAM
        // app
        this.glApp = PicoGL.createApp(mapCanvas).clearColor(0.0, 0.0, 0.0, 1.0);
        this.timer = this.glApp.createTimer();
        this.nanoTimer = new NanoTimer();

        // shader
        var program = this.glApp.createProgram(vertexShaderSource, fragmentShaderSource);

    // BUFFERS
    
        // object buffers
        var positions = this.glApp.createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
            -0.5, -0.5,
             0.5, -0.5,
             0.5,  0.5,
            -0.5,  0.5,
        ]));

        var idxBuffer = this.glApp.createIndexBuffer(PicoGL.UNSIGNED_INT, 3, new Uint32Array([0, 1, 2, 2, 3, 0]));

        var colors = this.glApp.createVertexBuffer(PicoGL.FLOAT, 3, new Float32Array([
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0,
            1.0, 1.0, 0.0,
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

        var instancedPos = this.glApp.createVertexBuffer(PicoGL.FLOAT, 2, instancedPosBuff);


    // TEXTURE

        const texture = this.glApp.createTextureArray(imageBuffer, detailDimension[detailLevel], detailDimension[detailLevel], mapTilesX * mapTilesY, {
            format: PicoGL.RGB,
            //internalFormat: PicoGL.RGB,
            generateMipmaps: false,
            wrapS: PicoGL.CLAMP_TO_EDGE,
            wrapT: PicoGL.CLAMP_TO_EDGE,
        });

    // UNIFORMS
        this.uniformBuffer = this.glApp.createUniformBuffer([
            PicoGL.FLOAT_VEC2,
            PicoGL.FLOAT_VEC2
        ])
        .set(0, this.camPosBuffer)
        .set(1, this.camScaleBuffer)
        .update();

    // VERTEX ARRAY
        var triangleArray = this.glApp.createVertexArray()
            .indexBuffer(idxBuffer)
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, colors)
            .instanceAttributeBuffer(2, instancedPos);

    // DRAWCALL
        this.drawCall = this.glApp.createDrawCall(program, triangleArray)
            .texture("texColor", texture)
            .uniformBlock("sceneUniforms", this.uniformBuffer)
            .uniform("aspectRatio", this.aspectRatio)
        ;

        this.nanoTimer.setInterval(() => { this._draw(); }, "", (1000.0 / 60.0) + "m");
        //this._draw();
    }

    _draw()
    {
        this.timer.start();

        this.glApp.clear();
        this.drawCall.draw();

        // only on update!!
        if(mapCanvas.width != mapCanvas.clientWidth || mapCanvas.height != mapCanvas.clientHeight)
        {
            mapCanvas.width = mapCanvas.clientWidth;
            mapCanvas.height = mapCanvas.clientHeight;

            this.aspectRatio[1] = mapCanvas.width / mapCanvas.height;
            this.drawCall.uniform("aspectRatio", this.aspectRatio);

            this.glApp.resize(mapCanvas.width, mapCanvas.height);
        }

        const camVelocityMinVal = 0.00001;
        //const camVelocityReduce = 0.75;
        const camVelocityReduce = 0.85;
        if(Math.abs(this.camVelocity[0]) > camVelocityMinVal || Math.abs(this.camVelocity[1]) > camVelocityMinVal)
        {
            this.camVelocity[0] *= camVelocityReduce;
            this.camVelocity[1] *= camVelocityReduce;

            this.camPosBuffer[0] += this.camVelocity[0];
            this.camPosBuffer[1] += this.camVelocity[1];

            this.uniformBuffer.set(0, this.camPosBuffer).update();
        }

        this.timer.end();
        //requestAnimationFrame(() => this._draw()); // @TODO use PicoGL timer?
        //setTimeout(() => this._draw(), 1000 / 60);
    }
};
