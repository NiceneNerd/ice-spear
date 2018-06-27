//const MAP_HEIGHT_SCALE = 0.0125;
const MAP_HEIGHT_SCALE = 0.012179;
const MAP_TILE_LENGTH = 256;
const MAP_TILE_SIZE = MAP_TILE_LENGTH * MAP_TILE_LENGTH;

module.exports = function(mapBuffer, tile)
{
    const geometry = new THREE.PlaneGeometry(1, 1, MAP_TILE_LENGTH-1, MAP_TILE_LENGTH-1);
    const material = new THREE.MeshNormalMaterial({side: THREE.DoubleSide});
    const mesh     = new THREE.Mesh( geometry, material );

    console.log(geometry.vertices.length);
    console.log(mesh);
    for(let i=0; i<MAP_TILE_SIZE; ++i)
    {
        geometry.vertices[i].z = mapBuffer.readUInt16LE(i*2) * MAP_HEIGHT_SCALE;
    }
    
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    mesh.name = "map";
    mesh.rotation.x = -(Math.PI / 2);

    return mesh;
}