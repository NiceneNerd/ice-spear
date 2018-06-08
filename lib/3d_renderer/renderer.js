/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Helper_Model    = require("./helper/model.js");
const Helper_Lighting = require("./helper/lighting.js");
const Helper_Camera   = require("./helper/camera.js");
const Helper_PostProc = require("./helper/post_processing.js");
const Helper_FPS_Controls   = require("./helper/fps_controls.js");
const Helper_Orbit_Controls = require("./helper/orbit_controls.js");
const Helper_Selector       = require("./helper/selector.js");

module.exports = class Renderer
{
    constructor(canvasNode)
    {
        this.THREE = THREE; // THREE is currently coming from the main html file due to incompatible JS files. @TODO port over to module format

        this.animFrame  = null;
        this.canvasNode = canvasNode;
        this.glContext  = this.canvasNode.getContext('webgl2');
        this.drawSize   = this.getCanvasNodeSize();

        this.scene    = new this.THREE.Scene();
        this.camera   = new this.THREE.PerspectiveCamera(75, this.drawSize.x / this.drawSize.y, 0.01, 2000 );
        this.renderer = new this.THREE.WebGLRenderer({
            canvas   : this.canvasNode,
            antialias: true,
            context  : this.glContext
        });

        this.helper = {
            model        : new Helper_Model(         this.THREE),
            lighting     : new Helper_Lighting(      this.THREE, this.scene, this.camera),
            camera       : new Helper_Camera(        this.THREE, this.camera),
            selector     : new Helper_Selector(      this.THREE, this.scene, this.camera, this.canvasNode),
            fpsControls  : new Helper_FPS_Controls(  this.THREE, this.scene, this.camera, this.canvasNode),
            orbitControls: new Helper_Orbit_Controls(this.THREE, this.camera, this.canvasNode),
            postProc     : new Helper_PostProc(      this.THREE, this.scene, this.camera, this.renderer),
        };

        this._init();
        this.changeCameraType('orbit');

        this.meshCube = this.helper.model.createBox();

        // TEST! @TODO pull light sources out of files, with a default as backup
        this.helper.lighting.setAmbientLight(0xEEEEFF);
    }

    clear()
    {
        this.stop();
    }

    _init()
    {
        this.scene.background = new this.THREE.Color(0x282C34);

        this.renderer.setSize(this.drawSize.x,this.drawSize.y);
        this.renderer.sortObjects = false;

        window.addEventListener('resize', event => {this.updateDrawSize();}, false );

        for(let name in this.helper)
            this.helper[name].init();
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

        if(this.drawSize.x > 0 && this.drawSize.y > 0)
        {
            for(let name in this.helper)
                this.helper[name].onResize(this.drawSize, oldSize);
        }
    }

    createModel(model)
    {
        return this.helper.model.createModel(model);
    }

    addObject(obj)
    {
        this.scene.add(obj);
    }

    createObjectGroup(name, addToScene = false)
    {
        const group = new THREE.Group();
        group.name = name;

        if(addToScene)
            this.scene.add(group);

        return group;
    }
    
    createBox()
    {
        const boxClone = this.meshCube.clone();
        return boxClone;
    }

    changeCameraType(type)
    {
        switch(type) {
            case 'fps':
                this.helper.orbitControls.disable();
                this.helper.fpsControls.enable();
            break;
            default:
            case 'orbit':
                this.helper.fpsControls.disable();
                this.helper.orbitControls.enable();
            break;
        }

        this.helper.camera.reset();
        
    }

    start()
    {
        this.updateDrawSize();

        if(this.animFrame == null)
        {
            this.animFrame = 0;
            this._frame();
        }
    }

    stop()
    {
        this.animFrame = null;
    }

    _frame()
    {
        if(this.animFrame != null)
        {
            this.animFrame = requestAnimationFrame(() => { this._frame(); });

            this._update();
            if(this.drawSize.x > 0 && this.drawSize.y > 0)
            {
                this._draw();
            }
        }
    }

    _update()
    {
        for(let name in this.helper)
            this.helper[name].update();
    }

    _draw()
    {
        for(let name in this.helper)
            this.helper[name].draw();
    }
};
