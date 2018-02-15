/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Renderer_Helpep_Texture = require("./texture.js");
const Base = require("./base.js");

module.exports = class Renderer_Helper_Model extends Base
{
    constructor(threeContext)
    {
        super(threeContext);

        this.helperTexture = new Renderer_Helpep_Texture(this.THREE);
    }

    createModel(model)
    {
        console.log(model);
        let geometry = new this.THREE.BufferGeometry();

        geometry.addAttribute('position', new this.THREE.BufferAttribute(model.vertexArray, 3));

        if(model.colorArray != null)
            geometry.addAttribute('color', new this.THREE.BufferAttribute(model.colorArray, 4));

        if(model.uv0Array != null)
            geometry.addAttribute('uv', new this.THREE.BufferAttribute(model.uv0Array, 2));

        if(model.uv1Array || model.uv0Array)
            geometry.addAttribute('uvNormalMap', new this.THREE.BufferAttribute((model.uv1Array || model.uv0Array), 2));

        geometry.setIndex(new this.THREE.BufferAttribute(model.indexArray, 1));

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        let materialConf = {};

        if(model.textureColor != null && model.textureColor.imageBuffer != null)
        {
            let texture = this.helperTexture.createTexture(model.textureColor.imageBuffer, model.textureColor.sizeX, model.textureColor.sizeY);
            //let texture = this.helperTexture.createTexture(model.textureNormal.imageBuffer, model.textureNormal.sizeX, model.textureNormal.sizeY); // TEST
            texture.name = model.name + "_color";
            texture.needsUpdate = true;

            materialConf.map = texture;
        }else{
            //materialConf.map = new THREE.TextureLoader().load("assets/img/texture_dummy.png"); // to debug UV coordinates
        }

        if(model.textureEmission != null && model.textureEmission.imageBuffer != null)
        {
            let texture = this.helperTexture.createTexture(model.textureEmission.imageBuffer, model.textureEmission.sizeX, model.textureEmission.sizeY);
            texture.name = model.name + "_emission";
            texture.needsUpdate = true;

            materialConf.emissive = new this.THREE.Color(0x4040FF); // @TODO read from FTEX/GX surface
            materialConf.emissiveIntensity = 0.0;
            materialConf.emissiveMap = texture;
        }

        if(model.textureNormal != null && model.textureNormal.imageBuffer != null)
        {
            let texture = this.helperTexture.createTexture(model.textureNormal.imageBuffer, model.textureNormal.sizeX, model.textureNormal.sizeY);
            texture.name = model.name + "_normal";
            texture.needsUpdate = true;

            materialConf.normalMap = texture;
        }

        //let material = materialConf.map != null ? new THREE.MeshBasicMaterial(materialConf) : new THREE.MeshNormalMaterial();
        let material = materialConf.map != null ? new this.THREE.MeshPhongMaterial(materialConf) : new this.THREE.MeshNormalMaterial();
        material.transparent = true;
        material.alphaTest = 0.125; // @TODO check if the texture has trnsparency

        //let material = new THREE.MeshNormalMaterial();

        let mesh = new this.THREE.Mesh( geometry, material );

        if(model.name != null)
            mesh.name = model.name;

        return mesh;
    }
};
