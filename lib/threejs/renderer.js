/**
* @author Max Bebök
*/

const THREE = require("three");
const Orbit_Controls = require('three-orbit-controls')(THREE);

module.exports = class Renderer
{
    constructor(node)
    {
        this.node = node;
        this.drawSize = {x: this.node.scrollWidth, y: this.node.scrollHeight};

        this.camera = new THREE.PerspectiveCamera(70, this.drawSize.x / this.drawSize.y, 0.01, 2000 );
        this.camera.position.z = -10;

        this.controls = new Orbit_Controls(this.camera);

        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(this.drawSize.x,this.drawSize.y);

        this.node.appendChild(this.renderer.domElement);


        var ambient = new THREE.AmbientLight( 0x444444 );
        this.scene.add( ambient );

        var light = new THREE.PointLight( 0xffffff );
        light.position.set( 1, 1, 1 );
        this.scene.add(light);

    }

    addModel(model)
    {
        let geometry = new THREE.BufferGeometry();

        geometry.addAttribute( 'position', new THREE.BufferAttribute( model.vertexArray, 3 ) );
        geometry.setIndex(new THREE.BufferAttribute(model.indexArray, 1));

        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        //let material = new THREE.MeshBasicMaterial( { color: 0xFF2020 } );
        let material = new THREE.MeshNormalMaterial();
        //let material = new THREE.MeshPhongMaterial({shininess: 1});

        let mesh = new THREE.Mesh( geometry, material );

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
