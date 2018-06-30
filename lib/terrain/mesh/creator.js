/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require("fs-extra");
const path = require("path");

const loadTerrainTextures = require("./../loader/texture");
const getTerrainShader = require("./terrain_shader");

const MAP_HEIGHT_SCALE = 0.012179;
const MAP_TILE_LENGTH = 256;
const MAP_TILE_SIZE = MAP_TILE_LENGTH * MAP_TILE_LENGTH;

const INDEX_COUNT_X = MAP_TILE_LENGTH - 1;
const INDEX_COUNT_Y = MAP_TILE_LENGTH - 1;

let staticIndexBuffer = undefined;

module.exports = class Terrain_Mesh_Creator
{
    constructor(gamePath, loader)
    {
        this.gamePath = gamePath;
        this.loader = loader;

        this.textures = undefined;
        console.log(this.textures);
    }

    async loadTerrainTexture()
    {
        this.textures = await loadTerrainTextures(this.gamePath);
    }

    async createTileMesh(meshBuffer, materialBuffer)
    {
        const geometry = new THREE.BufferGeometry();

        const vertexBuffer = this._createVertexBuffer(meshBuffer);
        const indexBuffer = staticIndexBuffer || this._createIndexBuffer();
        const uvBuffer = this._createUvBuffer();

        geometry.addAttribute('position', new THREE.BufferAttribute(vertexBuffer, 3 ));
        geometry.addAttribute('material', new THREE.BufferAttribute(materialBuffer, 4, false));
        geometry.addAttribute('uv', new THREE.BufferAttribute(uvBuffer, 2));

        geometry.setIndex(new THREE.BufferAttribute(indexBuffer, 1));

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
    
        const textureMap = new THREE.TextureLoader().load("assets/img/texture_grid_01.png"); // to debug UV coordinate
        const textureMapBlue = new THREE.TextureLoader().load("assets/img/texture_grid_02.png"); // to debug UV coordinate

        textureMap.wrapS = THREE.RepeatWrapping;
        textureMap.wrapT = THREE.RepeatWrapping;

        textureMapBlue.wrapS = THREE.RepeatWrapping;
        textureMapBlue.wrapT = THREE.RepeatWrapping;

        const terrainShader = await getTerrainShader();
        terrainShader.uniforms.tex00.value = textureMap;
        terrainShader.uniforms.tex01.value = textureMapBlue;

        const mesh = new THREE.Mesh( geometry, terrainShader );
        mesh.name = "field-tile";

        return mesh;      
    }

    _createVertexBuffer(meshBuffer)
    {
        const vertexBuffer = new Float32Array(MAP_TILE_SIZE * 3);
    
        let vertexIndex = 0;
        let bufferIndex = 0;
        for(let y=0; y<MAP_TILE_LENGTH; ++y)
        {
            const normY = y / INDEX_COUNT_Y;
    
            for(let x=0; x<MAP_TILE_LENGTH; ++x)
            {
                const heightValue = meshBuffer.readUInt16LE(bufferIndex*2) * MAP_HEIGHT_SCALE;
                ++bufferIndex;
    
                vertexBuffer[vertexIndex++] = x / INDEX_COUNT_X - 0.5;
                vertexBuffer[vertexIndex++] = heightValue;
                vertexBuffer[vertexIndex++] = normY - 0.5;
            }
        }

        return vertexBuffer;
    }

    _createUvBuffer()
    {
        const uvBuffer = new Float32Array(MAP_TILE_SIZE * 2);
    
        let uvIndex = 0;
        for(let y=0; y<MAP_TILE_LENGTH; ++y)
        {
            const normY = y / INDEX_COUNT_Y;
    
            for(let x=0; x<MAP_TILE_LENGTH; ++x)
            {
                const normX =  x / INDEX_COUNT_X;
                uvBuffer[uvIndex++] = normX * 4;
                uvBuffer[uvIndex++] = normY * 4;
            }
        }

        return uvBuffer;
    }

    _createIndexBuffer()
    {
        const indiceCount = (INDEX_COUNT_X) * (INDEX_COUNT_X) * 2 * 3; // x*y, 2 triangles per square, 3 points per triangle
        const indexBuffer = new Uint32Array(indiceCount);

        let i = 0;
        for(let y=0; y<INDEX_COUNT_Y; ++y)
        {
            for(let x=0; x<INDEX_COUNT_X; ++x)
            {
                const indexTop    = (y  ) * MAP_TILE_LENGTH + x;
                const indexBottom = (y+1) * MAP_TILE_LENGTH + x;
    
                indexBuffer[i++] = indexTop;
                indexBuffer[i++] = indexBottom;
                indexBuffer[i++] = indexBottom + 1;

                indexBuffer[i++] = indexBottom + 1;
                indexBuffer[i++] = indexTop + 1;
                indexBuffer[i++] = indexTop;
            }
        }

        staticIndexBuffer = indexBuffer;
        return indexBuffer;
    }
};