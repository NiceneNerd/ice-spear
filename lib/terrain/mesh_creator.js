//const MAP_HEIGHT_SCALE = 0.0125;
const MAP_HEIGHT_SCALE = 0.012179;
const MAP_TILE_LENGTH = 256;
const MAP_TILE_SIZE = MAP_TILE_LENGTH * MAP_TILE_LENGTH;

const INDEX_COUNT_X = MAP_TILE_LENGTH - 1;
const INDEX_COUNT_Y = MAP_TILE_LENGTH - 1;

let staticIndexBuffer = undefined;

class Terrain_Mesh_Creator
{
    constructor(mapBuffer)
    {
        this.mapBuffer = mapBuffer;
    }

    create()
    {
        const geometry = new THREE.BufferGeometry();

        const vertexBuffer = this._createVertexBuffer();
        const indexBuffer = staticIndexBuffer || this._createIndexBuffer();

        geometry.addAttribute('position', new THREE.BufferAttribute(vertexBuffer, 3 ));
        geometry.setIndex(new THREE.BufferAttribute(indexBuffer, 1));
    
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
    
        const material = new THREE.MeshNormalMaterial({side: THREE.FrontSide});

        const mesh = new THREE.Mesh( geometry, material );
        mesh.name = "penis";
    
        return mesh;      
    }

    _createVertexBuffer()
    {
        const vertexBuffer = new Float32Array(MAP_TILE_SIZE * 3);
    
        let vertexIndex = 0;
        let bufferIndex = 0;
        for(let y=0; y<MAP_TILE_LENGTH; ++y)
        {
            const normY = y / INDEX_COUNT_Y;
    
            for(let x=0; x<MAP_TILE_LENGTH; ++x)
            {
                const heightValue = this.mapBuffer.readUInt16LE(bufferIndex*2) * MAP_HEIGHT_SCALE;
                ++bufferIndex;
    
                vertexBuffer[vertexIndex++] = x / INDEX_COUNT_X - 0.5;
                vertexBuffer[vertexIndex++] = heightValue;
                vertexBuffer[vertexIndex++] = normY - 0.5;
            }
        }

        return vertexBuffer;
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

module.exports = function(mapBuffer)
{
    const creator = new Terrain_Mesh_Creator(mapBuffer);
    return creator.create();
};