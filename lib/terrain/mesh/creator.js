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
        const {texIndexBuffer, texIndexMap} = this._createTexIndexBuffer(materialBuffer);

        console.log(texIndexMap);

        geometry.addAttribute('position', new THREE.BufferAttribute(vertexBuffer, 3 ));
        geometry.addAttribute('materialMap', new THREE.BufferAttribute(texIndexBuffer, 4, false));
        geometry.addAttribute('uv', new THREE.BufferAttribute(uvBuffer, 2));

        geometry.setIndex(new THREE.BufferAttribute(indexBuffer, 1));

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        const shaderTextures = new Array(Object.keys(texIndexMap).length);
        for(let texIdx in texIndexMap)
        {
            console.log([texIndexMap[texIdx], texIdx]);
            shaderTextures[texIndexMap[texIdx]] = this.textures[texIdx];
        }

        const terrainShader = await getTerrainShader(shaderTextures);
/*
        const textureMap = new THREE.TextureLoader().load("assets/img/texture_grid_01.png"); // to debug UV coordinate
        const textureMapBlue = new THREE.TextureLoader().load("assets/img/texture_grid_02.png"); // to debug UV coordinate

        textureMap.wrapS = THREE.RepeatWrapping;
        textureMap.wrapT = THREE.RepeatWrapping;

        textureMapBlue.wrapS = THREE.RepeatWrapping;
        textureMapBlue.wrapT = THREE.RepeatWrapping;

        terrainShader.uniforms.tex00.value = textureMap;
        terrainShader.uniforms.tex01.value = textureMapBlue;
*/

        //terrainShader.uniforms.tex00.value = this.textures[0];
/*
        terrainShader.uniforms.tex00.value = this.textures[0];
        terrainShader.uniforms.tex01.value = this.textures[1];
        terrainShader.uniforms.tex02.value = this.textures[2];
        terrainShader.uniforms.tex03.value = this.textures[3];
*/
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
    
        const uvScale = 1;
        let uvIndex = 0;
        for(let y=0; y<MAP_TILE_LENGTH; ++y)
        {
            const normY = y / INDEX_COUNT_Y;
    
            for(let x=0; x<MAP_TILE_LENGTH; ++x)
            {
                const normX =  x / INDEX_COUNT_X;
                uvBuffer[uvIndex++] = normX * uvScale;
                uvBuffer[uvIndex++] = normY * uvScale;
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

    _createTexIndexBuffer(materialBuffer)
    {
        const texIndexBuffer = new Uint32Array(materialBuffer.length);
        const texIndexMap = {};
        let lastIndex = 0;
        const indexMapping = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 17, 18, 0, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 7, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 0, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82];
        for(let i=0; i<materialBuffer.length; i+=4)
        {
            const realIndex = indexMapping[materialBuffer[i]];
            
            if(texIndexMap[realIndex] === undefined)
            {
                texIndexMap[realIndex] = lastIndex++;
            }

            texIndexBuffer[i]   = texIndexMap[realIndex];
            texIndexBuffer[i+1] = materialBuffer[i+1];
            texIndexBuffer[i+2] = materialBuffer[i+2];
            texIndexBuffer[i+3] = materialBuffer[i+3];
        }
        //console.log(`Idx-Count: ${Object.keys(usedIdx).length}`);
        //console.log(usedIdx);

        return {texIndexBuffer, texIndexMap};
    }
};