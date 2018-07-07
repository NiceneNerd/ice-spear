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

    _createBox()
    {
        let geometry = new this.THREE.BoxGeometry( CUBE_SIZE, CUBE_SIZE, CUBE_SIZE );
        
        for(let i=0; i<geometry.faces.length; i++) 
        {
            geometry.faces[i].color.setHex(CUBE_COLORS[i >> 1]);
        }

        let material = new this.THREE.MeshBasicMaterial( {color: 0xFFFFFF, vertexColors: THREE.FaceColors} );
        return new this.THREE.Mesh( geometry, material );
    }

    //@TODO instance
    createBox() 
    {
        console.info("Create Box");
       let boxGeometry = new this.THREE.BoxBufferGeometry( CUBE_SIZE, CUBE_SIZE, CUBE_SIZE );

       var geometry = new THREE.InstancedBufferGeometry();
       geometry.index = boxGeometry.index;
       geometry.attributes.position = boxGeometry.attributes.position;
       geometry.attributes.uv = boxGeometry.attributes.uv;

       var lastTime = 0;
       var moveQ = new THREE.Quaternion( 0.5, 0.5, 0.5, 0.0 ).normalize();
       var tmpQ = new THREE.Quaternion();
       var currentQ = new THREE.Quaternion();

       var instances = 5;
       var offsets = [0,0,0];
       var orientations = [];
       var vector = new THREE.Vector4();
      

       var offsetAttribute = new THREE.InstancedBufferAttribute( new Float32Array( offsets ), 3 );
/*var  t = 0;
       setInterval(() => {
           console.log(offsetAttribute.count);
            for ( var i = 0, il = offsetAttribute.count; i < il; i ++ ) {
                offsetAttribute.setXYZ(i, t, t, t);
                t+= 0.0025;
            }
            offsetAttribute.needsUpdate = true;

       }, 10);*/

        geometry.addAttribute( 'offset', offsetAttribute );

       var material = new THREE.RawShaderMaterial( {
        //uniforms: {map: { value: new THREE.TextureLoader().load( 'textures/crate.gif' ) }},
        fragmentShader: `#version 300 es
            precision highp float;

            out vec4 fragmentColor;

            uniform sampler2D map;
            in vec2 vUv;

            void main() {
                //fragmentColor = texture( map, vUv );
                fragmentColor = vec4(1.0);
            }`,
        vertexShader: `#version 300 es
            precision highp float;
  
            layout (location = 0) in vec3 position;
            layout (location = 2) in vec3 offset;

            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            uniform vec2 uv;

            out vec2 vUv;

            void main() 
            {
                vec3 vPosition =  position;
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( offset + vPosition, 1.0 );
            }`
        } );
        const mesh = new this.THREE.Mesh( geometry, material );
        console.log(mesh);
        return mesh;
    }
};
