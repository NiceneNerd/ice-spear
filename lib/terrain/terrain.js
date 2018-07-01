/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const path = require("path");

const TSCB = require("./../../lib/tscb/tscb");
const Pack_Loader = require("./loader/pack");
const Section_Helper = require("./section_helper");

const loadTileMaterial = require("./loader/material");
const loadTileMesh = require("./loader/mesh");
const Terrain_Mesh_Creator = require("./mesh/creator");

const SECTION_WIDTH = 1000.0;
const TILE_GRID_SIZE_X = 32;
const TILE_GRID_SIZE_Y = 32;

const TILE_TO_SECTION_SCALE = 0.5;

const LOD_MAX = 0.125;
const LOD_MIN = 32;
const LOD_NUM = 8;

const LOD_LEVEL_MAX = 8;
const LOD_LEVEL_MAP = {
    8: 0.125,
    7: 0.25,
    6: 0.5,
    5: 1,
    4: 2,
    3: 4,
    2: 8,
    1: 16,
    0: 32,
};

module.exports = class Terrain
{
    /**
     * @param {string} gamePath 
     * @param {Loader} loader 
     */
    constructor(gamePath, loader)  
    {
        this.gamePath = gamePath;
        this.loader = loader;

        this.tscbData = undefined;
        this.pathMainField = path.join(gamePath, "content", "Terrain", "A", "MainField");

        this.packLoader = new Pack_Loader(this.pathMainField);
        this.meshCreator = new Terrain_Mesh_Creator(this.gamePath, this.loader);
    }

    loadTerrainTscb()
    {
        const tscbFile = path.join(this.gamePath, "content", "Terrain", "A", "MainField.tscb");
        this.tscbData = TSCB.parseTSCB(tscbFile);
        console.log(this.tscbData);
    }

    async loadSectionMesh(sectionName, lodLevel = LOD_LEVEL_MAX)
    {
        await this.loader.setStatus("Get Terrain Tiles");

        lodLevel = Math.min(LOD_LEVEL_MAX, lodLevel);
        lodLevel = Math.max(0, lodLevel);

        const lodScale         = LOD_LEVEL_MAP[lodLevel];
        const sectionMidpoint  = Section_Helper.getSectionMidpoint(sectionName);
        const sectionTiles     = TSCB.getSectionTilesByPos(this.tscbData.tiles, lodScale, sectionMidpoint, SECTION_WIDTH);
        const tileSectionScale = TILE_GRID_SIZE_X / (LOD_MIN / lodScale) * SECTION_WIDTH * TILE_TO_SECTION_SCALE;

        await this.loader.setStatus("Load Terrain Textures");

        await this.meshCreator.loadTerrainTexture();

        await this.loader.setStatus("Load Terrain Mesh");

        const meshArray = [];
        for(const tile of sectionTiles)
        {
            console.warn("TILE");
            console.log(tile);

            await this.loader.setInfo(`Tile ${meshArray.length+1} / ${sectionTiles.length}`);
            meshArray.push(await this.createTile(tile, tileSectionScale));
        }

        return meshArray;
    }

    async createTile(tile, tileSectionScale)
    {
        const materialBuffer = loadTileMaterial(this.packLoader, tile);
        const meshBuffer = loadTileMesh(this.packLoader, tile);

        const mesh = await this.meshCreator.createTileMesh(meshBuffer, materialBuffer);
        if(!mesh) {
            console.error(`Could not load tile '${tile.name}'!`);
            return undefined;
        }

        mesh.position.x = tile.center[0] * SECTION_WIDTH * TILE_TO_SECTION_SCALE;
        mesh.position.z = tile.center[1] * SECTION_WIDTH * TILE_TO_SECTION_SCALE;

        mesh.scale.x = tileSectionScale;
        mesh.scale.z = tileSectionScale;

        return mesh;
    }
}