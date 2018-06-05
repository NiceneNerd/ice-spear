/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Renderer_Helpep_Texture = require("./texture.js");
const Base = require("./base.js");

const CUBE_COLORS = [
    0xFF0000, 0x00FF00, 0x0000FF,
    0x00FFFF, 0xFFFF00, 0xFF00FF
];
const CUBE_SIZE = 1.01; // most non-model actors are placed exactly 1 unit inside walls, add a tiny bit to one to prevent clipping/flickering

module.exports = class Renderer_Helper_Model extends Base
{
    constructor(threeContext)
    {
        super(threeContext);

        this.helperTexture = new Renderer_Helpep_Texture(this.THREE);
    }

    _createTexture(textureData, name)
    {
        if(textureData != null && textureData.imageBuffer != null)
        {
            let texture = this.helperTexture.createTexture(textureData.imageBuffer, textureData.sizeX, textureData.sizeY);
            texture.name = name;
            texture.needsUpdate = true;
            return texture;
        }
        return undefined;
    }

    createModel(model)
    {
        let geometry = new this.THREE.BufferGeometry();

        geometry.addAttribute('position', new this.THREE.BufferAttribute(model.vertexArray, 3));

        if(model.colorArray != null)
            geometry.addAttribute('color', new this.THREE.BufferAttribute(model.colorArray, 4));

        if(model.uv0Array != null)
            geometry.addAttribute('uv', new this.THREE.BufferAttribute(model.uv0Array, 2));

        model.uv1Array = null; // @TODO: figure out when to use which UV set
        
        if(model.uv1Array || model.uv0Array)
            geometry.addAttribute('uvNormalMap', new this.THREE.BufferAttribute((model.uv1Array || model.uv0Array), 2));

        geometry.setIndex(new this.THREE.BufferAttribute(model.indexArray, 1));

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        let materialConf = {};
        let texture;

        if(texture = this._createTexture(model.textureColor, `${model.name}_color`))
            materialConf.map = texture;

        if(texture = this._createTexture(model.textureNormal, `${model.name}_normal`))
            materialConf.normalMap = texture;

        if(texture = this._createTexture(model.emissiveMap, `${model.name}_emission`))
        {
            materialConf.emissiveMap = texture;
            materialConf.emissive = new this.THREE.Color(0x4040FF); // @TODO read from FTEX/GX surface
            materialConf.emissiveIntensity = 0.0;
        }

        //materialConf.map = new THREE.TextureLoader().load("assets/img/texture_dummy.png"); // to debug UV coordinates

        let material = materialConf.map != null ? new this.THREE.MeshPhongMaterial(materialConf) : new this.THREE.MeshNormalMaterial();
        material.transparent = true;
        material.alphaTest = 0.125; // @TODO check if the texture has trnsparency

        let mesh = new this.THREE.Mesh( geometry, material );

        if(model.name != null)
            mesh.name = model.name;

        return mesh;
    }

    createBox() 
    {
        let geometry = new this.THREE.BoxGeometry( CUBE_SIZE, CUBE_SIZE, CUBE_SIZE );
        for(let i=0; i<geometry.faces.length; i++) 
        {
            geometry.faces[i].color.setHex(CUBE_COLORS[i >> 1]);
        }

        let material = new this.THREE.MeshBasicMaterial( {color: 0xFFFFFF, vertexColors: THREE.FaceColors} );
        return new this.THREE.Mesh( geometry, material );
    }
};
