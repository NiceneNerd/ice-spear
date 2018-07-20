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
        const imageBuffer = await this.textureHandler.load();

        await this.engine.createShader("map", path.join(this.shaderPath, "map.glsl.vert"), path.join(this.shaderPath, "map.glsl.frag"));

        const texture = this.engine.createTexture(imageBuffer, this.textureHandler.getSize(), {
            format: PicoGL.RGB,
            generateMipmaps: false,
            wrapS: PicoGL.CLAMP_TO_EDGE,
            wrapT: PicoGL.CLAMP_TO_EDGE,
        });

        const mapVertexArray = createMapMesh(this.engine.getApp(), mapTilesX, mapTilesY);
        const mapDrawCall = this.engine.createDrawCall("map", mapVertexArray, true)
            .texture("texColor", texture)
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