/**
* @author Max Bebök
*/

//const THREE = require("three");
const THREE = require("./three.min.js");
const Orbit_Controls = require('three-orbit-controls')(THREE);

module.exports = class Renderer
{
    constructor(canvasNode)
    {
        this.canvasNode = canvasNode;
        this.drawSize   = this.getCanvasNodeSize();

        // setup camera and controls
        this.camera = new THREE.PerspectiveCamera(70, this.drawSize.x / this.drawSize.y, 0.01, 2000 );
        this.camera.position.z = -10;
        this.tanFOV = Math.tan( ( ( Math.PI / 180 ) * this.camera.fov / 2 ) );

        this.controls = new Orbit_Controls(this.camera, this.canvasNode);
        this.scene    = new THREE.Scene();

        let gl;
        try {
            //gl = canvasNode.getContext('webgl');
            gl = canvasNode.getContext('webgl2');
        } catch (err) {
            console.error(err);
        }

        // setup renderer and events for the canvas
        this.renderer = new THREE.WebGLRenderer({
            canvas   : canvasNode,
            antialias: true,
            context: gl
        });
        this.renderer.setSize(this.drawSize.x,this.drawSize.y);

        window.addEventListener('resize', event => {this.updateDrawSize();}, false );

        // add some light
        var ambient = new THREE.AmbientLight( 0x444444 );
        this.scene.add( ambient );

        var light = new THREE.PointLight( 0xffffff );
        light.position.set( 1, 1, 1 );
        this.scene.add(light);

    }

    getCanvasNodeSize()
    {
        return  {x: this.canvasNode.scrollWidth, y: this.canvasNode.scrollHeight};
    }

    setCanvasNodeSize(x, y)
    {
        this.canvasNode.style.width  = x;
        this.canvasNode.style.height = y;
    }

    updateDrawSize()
    {
        let oldSize = this.drawSize;
        this.setCanvasNodeSize("100%", "100%");
        this.drawSize = this.getCanvasNodeSize();

        this.camera.aspect = this.drawSize.x / this.drawSize.y;
        this.camera.fov = ( 360 / Math.PI ) * Math.atan( this.tanFOV * ( this.drawSize.y / oldSize.y ) );

        this.camera.updateProjectionMatrix();
        this.camera.lookAt( this.scene.position );

        this.renderer.setSize( this.drawSize.x, this.drawSize.y );
    }

    _createTexture(buffer, sizeX, sizeY)
    {
        let texture = new THREE.DataTexture(buffer, sizeX, sizeY, THREE.RGBAFormat);

        texture.wrapS = THREE.RepeatWrapping; // @TODO read from FTEX/GX surface
        texture.wrapT = THREE.RepeatWrapping;

        texture.magFilter = THREE.LinearFilter; // @TODO read from FTEX/GX surface
        texture.minFilter = THREE.LinearFilter;

        return texture;
    }

    addModel(model)
    {
        let geometry = new THREE.BufferGeometry();

        geometry.addAttribute('position', new THREE.BufferAttribute(model.vertexArray, 3));

        if(model.colorArray != null)
            geometry.addAttribute('color', new THREE.BufferAttribute(model.colorArray, 4));

        if(model.uv0Array != null)
            geometry.addAttribute('uv', new THREE.BufferAttribute(model.uv0Array, 2));

        geometry.setIndex(new THREE.BufferAttribute(model.indexArray, 1));

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        let materialConf = {};

        if(model.textureColor != null && model.textureColor.imageBuffer != null)
        {
            let texture = this._createTexture(model.textureColor.imageBuffer, model.textureColor.sizeX, model.textureColor.sizeY);
            texture.name = model.name + "_color";
            texture.needsUpdate = true;

            materialConf.map = texture;
        }else{
            //materialConf.map = new THREE.TextureLoader().load("assets/img/texture_dummy.png"); // to debug UV coordinates
        }

        if(model.textureEmission != null && model.textureEmission.imageBuffer != null)
        {
            let texture = this._createTexture(model.textureEmission.imageBuffer, model.textureEmission.sizeX, model.textureEmission.sizeY);
            texture.name = model.name + "_emission";
            texture.needsUpdate = true;

            materialConf.emissive = new THREE.Color(0x4040FF); // @TODO read from FTEX/GX surface
            materialConf.emissiveMap = texture;
        }

        if(model.textureNormal != null && model.textureNormal.imageBuffer != null)
        {
            let texture = this._createTexture(model.textureNormal.imageBuffer, model.textureNormal.sizeX, model.textureNormal.sizeY);
            texture.name = model.name + "_normal";
            texture.needsUpdate = true;

            materialConf.normalMap = texture;
        }

        //let material = materialConf.map != null ? new THREE.MeshBasicMaterial(materialConf) : new THREE.MeshNormalMaterial();
        let material = materialConf.map != null ? new THREE.MeshPhongMaterial(materialConf) : new THREE.MeshNormalMaterial();
        //let material = new THREE.MeshNormalMaterial();

        let mesh = new THREE.Mesh( geometry, material );

        if(model.name != null)
            mesh.name = model.name;

        this.scene.add(mesh);
    }

    addPointMesh(points)
    {
        let geometry = new THREE.Geometry();

        var vertex = new THREE.Vector3();
        for(let point of points)
        {
            var vertex = new THREE.Vector3();
			vertex.x = point[0];
			vertex.y = point[1];
			vertex.z = point[2];

            geometry.vertices.push(vertex);
        }
        let material = new THREE.PointsMaterial({
            size: 0.025
        });

        this.mesh = new THREE.Points(geometry, material);
        this.scene.add(this.mesh);
    }

    start()
    {
        this._frame();
    }

    _frame()
    {
        this.animFrame = requestAnimationFrame(() => { this._frame(); });

        this._update();
        this._draw();
    }

    _update()
    {

    }

    _draw()
    {
        this.renderer.render(this.scene, this.camera);
    }
};
