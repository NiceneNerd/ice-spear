/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs-extra');
const path = require('path');

const Ice_Engine = require("./../ice_engine/engine");

const World_Map_Texture = require('./texture');
const createMapMesh = require('./mesh');
const Camera = require("./camera");

const PicoGL = require("picogl");

const mapTilesX = 12;
const mapTilesY = 10;

module.exports = class World_Map
{
    constructor(gamePath, cachePath, loader)
    {
        this.gamePath = gamePath;
        this.cachePath = cachePath;
        this.loader = loader;

        this.engine = new Ice_Engine(mapCanvas);
        this.engine.onUpdate(() => this._update());

        const texBasePath = path.join(this.gamePath, "content", "UI", "MapTex", "MainField");
        this.textureHandler = new World_Map_Texture(texBasePath, this.cachePath, mapTilesX, mapTilesY, this.loader);

        this.camera = new Camera(this.engine);

        this.shaderPath = path.join(__BASE_PATH, "apps", "map_editor", "lib", "shader");
    }

    _addEvents()
    {
        document.onwheel     = ev => this.camera.onScroll(ev);
        document.onmousemove = ev => this.camera.onMove(ev);
    }

    async load()
    {
        await this.loader.setStatus("Loading Textures");
        const mapImageBuffer = await this.textureHandler.load();

        await this.engine.createShader("map",  path.join(this.shaderPath, "map.glsl.vert"),  path.join(this.shaderPath, "map.glsl.frag"));
        await this.engine.createShader("icon", path.join(this.shaderPath, "icon.glsl.vert"), path.join(this.shaderPath, "icon.glsl.frag"));

        const mapTexture = this.engine.createTexture(mapImageBuffer, this.textureHandler.getSize(), {
            format: PicoGL.RGB,
            generateMipmaps: false,
            wrapS: PicoGL.CLAMP_TO_EDGE,
            wrapT: PicoGL.CLAMP_TO_EDGE,
        });

        const mapVertexArray = createMapMesh(this.engine.getApp(), mapTilesX, mapTilesY);
        const mapDrawCall = this.engine.createDrawCall("map", mapVertexArray, true)
            .texture("texColor", mapTexture)
            .uniformBlock("globalUniforms", this.engine.getGlobalUniform())
            .uniformBlock("cameraUniforms", this.camera.getUniformBuffer());

    // ICONS

    
        const posBuffer = this.engine.getApp().createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
            -1.0, -1.0,  1.0, -1.0,
            1.0,  1.0, -1.0,  1.0,
        ]));

        const uvBuffer = this.engine.getApp().createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
            0.0, 0.0, 1.0, 0.0,
            1.0, 1.0, 0.0, 1.0,
        ]));
       
        const instanceBuffer = this.engine.getApp().createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
            0.0, 0.0,
            2.0, 2.0,
        ]));

        const idxBuffer = this.engine.getApp().createIndexBuffer(PicoGL.UNSIGNED_INT, 3, new Uint32Array([0, 1, 2, 2, 3, 0]));

        const iconVertexArray = this.engine.getApp().createVertexArray()
            .indexBuffer(idxBuffer)
            .vertexAttributeBuffer(0, posBuffer)
            .vertexAttributeBuffer(1, uvBuffer)
            .instanceAttributeBuffer(2, instanceBuffer);

        const iconShrineBuffer = await fs.readFile(path.join(__BASE_PATH, "assets", "img", "map", "shrine.bin"));
        const iconShrineTexture =  this.engine.createTexture(iconShrineBuffer, {x: 128, y:128}, {
            wrapS: PicoGL.CLAMP_TO_EDGE,
            wrapT: PicoGL.CLAMP_TO_EDGE,
            flipY: true
        });

        const iconDrawCall = this.engine.createDrawCall("icon", iconVertexArray, true)
            .texture("texColor", iconShrineTexture)
            .uniformBlock("globalUniforms", this.engine.getGlobalUniform())
            .uniformBlock("cameraUniforms", this.camera.getUniformBuffer());

        this._addEvents();
    }

    start()
    {
        this.engine.start();
    }

    _update()
    {
        this.camera.update();
    }
}