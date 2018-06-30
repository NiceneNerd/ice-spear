/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require("fs-extra");
const path = require("path");
const Binary_File = require('binary-file');
const SARC = require("sarc-lib");

const TSCB = require("./../../lib/tscb/tscb");
const createMeshFromBuffer = require("./mesh_creator");

const SECTION_WIDTH = 1000.0;
const SECTIONS_X = 12;
const SECTIONS_Y = 12;
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

        const lodTotalSegments = Math.pow(2, lodLevel);
        const lodScale         = LOD_LEVEL_MAP[lodLevel];
        const sectionMidpoint  = this.getSectionMidpoint(sectionName);
        const sectionTiles     = TSCB.getSectionTilesByPos(this.tscbData.tiles, lodScale, sectionMidpoint, SECTION_WIDTH);
        const tileSectionScale = TILE_GRID_SIZE_X / (LOD_MIN / lodScale) * SECTION_WIDTH * TILE_TO_SECTION_SCALE;

        await this.loader.setStatus("Load Terrain Mesh");

        const meshArray = [];
        for(const tile of sectionTiles)
        {
            await this.loader.setInfo(`Tile ${meshArray.length+1} / ${sectionTiles.length}`);

            const mesh = this._loadTileMesh(tile);
            if(!mesh) {
                console.error(`Could not load tile '${tile.name}'!`);
                continue;
            }

            mesh.position.x = tile.center[0] * SECTION_WIDTH * TILE_TO_SECTION_SCALE;
            mesh.position.z = tile.center[1] * SECTION_WIDTH * TILE_TO_SECTION_SCALE;

            mesh.scale.x = tileSectionScale;
            mesh.scale.z = tileSectionScale;

            meshArray.push(mesh);
        }

        return meshArray;
    }

    _loadTileMesh(tile)
    {
        const ssteraPackName = `${this._getTilePackName(tile.name)}.hght.sstera`;
        const ssteraPackPath = path.join(this.pathMainField, ssteraPackName);

        const sarc = new SARC();
        sarc.parse(ssteraPackPath);
        const mapBuffer = sarc.getFile(`${tile.name}.hght`);

        return createMeshFromBuffer(mapBuffer);
    }

    _getTilePackName(terrainSection)
    {
        return (Math.floor(parseInt(terrainSection, 16) / 4) * 4)
                .toString(16).toUpperCase();
    }

    sectionNameToCoords(sectionName)
    {
        const nums = sectionName.split("-");
        nums[0] = nums[0].charCodeAt() - "A".charCodeAt() - 1;
        nums[1] = parseInt(nums[1]);
        return nums;
    }

    getSectionMidpoint(sectionName)
    {
        const [x,y] = this.sectionNameToCoords(sectionName);
        return new THREE.Vector3(
            (x - 3.5) * 1000,
            300,
            (y - 4.5) * 1000
        );
    }
}