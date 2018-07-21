/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const path = require('path');

const Ice_Engine = require("./../ice_engine/engine");

const World_Map_Texture = require('./texture');
const createMapMesh = require('./mesh');
const Camera = require("./camera");
const Locations = require("./location");
const Icon = require("./icon");
const Selector = require("./select");

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
        this.locations = new Locations(this.gamePath, this.cachePath);
        this.icons = new Icon(this.engine);

        this.selector = new Selector(mapCanvas, this.engine.aspectRatio, this.camera, this.icons);

        this.shaderPath = path.join(__BASE_PATH, "apps", "map_editor", "lib", "shader");
    }

    _addEvents()
    {
        document.onmouseup   = ev => this.selector.onMouseUp(ev);
        document.onmousedown = ev => this.selector.onMouseDown(ev);
        document.onwheel     = ev => this.camera.onScroll(ev);
        document.onmousemove = ev => {
            this.selector.onMove(ev);
            this.camera.onMove(ev);
        };
    }

    async load()
    {
        await this.loader.setStatus("Loading Locations");
        await this.locations.load();

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

        const iconDrawCall = await this.icons.createDrawCall(this.locations.getLocations());
        iconDrawCall.uniformBlock("cameraUniforms", this.camera.getUniformBuffer());

        this._addEvents();
    }

    start()
    {
        this.engine.start();
    }

    _update()
    {
        this.camera.update();
        this.selector.update();
    }
}