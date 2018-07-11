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
const CUBE_COLORS_FLOAT = [
    [1.0, 0.0, 0.0, 1.0], [0.0, 1.0, 0.0, 1.0], [0.0, 0.0, 1.0, 1.0],
    [0.0, 1.0, 1.0, 1.0], [1.0, 1.0, 0.0, 1.0], [1.0, 0.0, 1.0, 1.0]
];

const CUBE_SIZE = 1.01; // most non-model actors are placed exactly 1 unit inside walls, add a tiny bit to one to prevent clipping/flickering

module.exports = class Renderer_Helper_Model extends Base
{
    constructor(threeContext, helperShader)
    {
        super(threeContext);

        this.helperShader = helperShader;
        this.helperTexture = new Renderer_Helpep_Texture(this.THREE);

        this.textureGridBW = new THREE.TextureLoader().load("assets/img/texture_grid_01.png"); // to debug UV coordinates
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

            /*
        if(texture = this._createTexture(model.textureEmission, `${model.name}_emission`))
        {
            materialConf.emissiveMap = texture;
            materialConf.emissive = new this.THREE.Color(0x4040FF); // @TODO read from FTEX/GX surface
            materialConf.emissiveIntensity = 1.0;
        }
        */

        //materialConf.map = new THREE.TextureLoader().load("assets/img/texture_dummy.png"); // to debug UV coordinates

        let material = materialConf.map != null ? new this.THREE.MeshPhongMaterial(materialConf) : new this.THREE.MeshNormalMaterial();
        material.transparent = true;
        material.alphaTest = 0.125; // @TODO check if the texture has trnsparency

        let mesh = new this.THREE.Mesh( geometry, material );

        if(model.name != null)
            mesh.name = model.name;

        return mesh;
    }

    async createInstancedModel(model)
    {
        const geometry = new THREE.InstancedBufferGeometry();
        geometry.setIndex(new this.THREE.BufferAttribute(model.indexArray, 1));
        geometry.addAttribute('position', new this.THREE.BufferAttribute(model.vertexArray, 3));

        if(model.uv0Array != null)
            geometry.addAttribute('uv', new this.THREE.BufferAttribute(model.uv0Array, 2));

        if(model.colorArray != null)
            geometry.addAttribute('color', new this.THREE.BufferAttribute(model.colorArray, 4));

        model.uv1Array = null; // @TODO: figure out when to use which UV set
        
        if(model.uv1Array || model.uv0Array)
            geometry.addAttribute('uvNormalMap', new this.THREE.BufferAttribute((model.uv1Array || model.uv0Array), 2));

        //geometry.computeFaceNormals();
        //geometry.computeVertexNormals();
        //geometry.maxInstancedCount = 5;

        const uniforms = {
            colorBlendFactor: {value: 0.0},
        };

        let texture;
        if(texture = this._createTexture(model.textureColor, `${model.name}_color`))
            uniforms.texColor = {type: "t", value: texture};
        else
            uniforms.texColor = {type: "t", value: this.textureGridBW};

        //if(texture = this._createTexture(model.textureNormal, `${model.name}_normal`))
            //uniforms.texNormal = {type: "t", value: textureNormal};

            /*
        if(texture = this._createTexture(model.textureEmission, `${model.name}_emission`))
        {
            materialConf.emissiveMap = texture;
            materialConf.emissive = new this.THREE.Color(0x4040FF); // @TODO read from FTEX/GX surface
            materialConf.emissiveIntensity = 1.0;
        }
        */

        const material = await this.helperShader.getShader("actor");
        material.uniforms = uniforms;
        material.transparent = true;

        const mesh = new this.THREE.Mesh(geometry, material);
        mesh.frustumCulled = false;

        if(model.name != null)
            mesh.name = model.name;

        return mesh;
    }

    async createInstancedBox() 
    {
        const boxGeometry = new this.THREE.BoxBufferGeometry( CUBE_SIZE, CUBE_SIZE, CUBE_SIZE );
        const geometry = new THREE.InstancedBufferGeometry();    

        geometry.setIndex(new this.THREE.BufferAttribute(boxGeometry.index.array, 1));
        geometry.addAttribute('position', new this.THREE.BufferAttribute(boxGeometry.attributes.position.array, 3));
        geometry.addAttribute('uv', new this.THREE.BufferAttribute(boxGeometry.attributes.uv.array, 2));

        const colorBuffer = new Float32Array(12 * 2 * 4);
        let colorBufferIndex = 0;
        let colorIndex = 0;
        for(let i=0; i<6; ++i)
        {
            colorBuffer.set(CUBE_COLORS_FLOAT[colorIndex], colorBufferIndex);
            colorBuffer.set(CUBE_COLORS_FLOAT[colorIndex], colorBufferIndex + 4);
            colorBuffer.set(CUBE_COLORS_FLOAT[colorIndex], colorBufferIndex + 8);
            colorBuffer.set(CUBE_COLORS_FLOAT[colorIndex], colorBufferIndex + 12);
            colorBufferIndex += 16;
            ++colorIndex;
        }

       geometry.addAttribute('color', new this.THREE.BufferAttribute(colorBuffer, 4));

       const uniforms = {
            colorBlendFactor: {value: 0.75},
            texColor: {type: "t", value: this.textureGridBW}
       };

       const material = await this.helperShader.getShader("actor");
       material.uniforms = uniforms;

       const mesh = new this.THREE.Mesh(geometry, material);
       mesh.frustumCulled = false;
       return mesh;
    }
};
