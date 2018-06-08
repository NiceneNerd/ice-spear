/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Base = require("./base.js");

module.exports = class Renderer_Helper_FPS_Controls extends Base
{
    constructor(threeContext, scene, camera, canvasNode)
    {
        super(threeContext);

        this.camera    = camera;
        this.scene     = scene;
        this.canvasNode  = canvasNode;
        this.eventNode = document;

        this.raycaster = new THREE.Raycaster();

        this.oldEulerOrder = this.camera.rotation.order;

        this.eventNamesKeys  = ["keydown", "keyup"];
        this.eventNamesMouse = ["mousemove", "mousedown", "mouseup"];

        this._handlerMouseWrapper = e => this._handlerMouse(e);
        this._handlerKeysWrapper  = e => this._handlerKeys(e);

        this.camSpeed = 0.125;
        this.camRotSpeed = 0.005;

        this.camMoveDirection = new this.THREE.Vector3(0.0, 0.0, 0.0);
        this.camMoveSpeed = 0.0;

        this.mouseDown = false;
        this.mousePosNorm = new this.THREE.Vector2(0.0, 0.0);
        this.mouseInCanvas = false;

        this.invertedX = -1;
        this.invertedY = -1;
    
    }
    
    _clamp(val, min, max)
    {
        return Math.max(min, Math.min(val, max));
    }

    _handlerMouse(e)
    {
        if(e.type != "mousemove")
        {
            this.mouseDown = e.type == "mousedown";
        }else{

            let canvasRect = this.canvasNode.getBoundingClientRect();
            this.mousePosNorm.x = e.clientX - canvasRect.left;
            this.mousePosNorm.y = e.clientY - canvasRect.top;

            if(this.mousePosNorm.x < 0 || this.mousePosNorm.x > canvasRect.width ||
               this.mousePosNorm.y < 0 || this.mousePosNorm.y > canvasRect.height)
            {
                this.mouseInCanvas = false;
                return;
            }

            this.mouseInCanvas = true;
            this.mousePosNorm.x =  (this.mousePosNorm.x / canvasRect.width)  * 2 - 1;
	        this.mousePosNorm.y = -(this.mousePosNorm.y / canvasRect.height) * 2 + 1;

            if(this.mouseDown)
            {
                let rotX = e.movementY * this.camRotSpeed * this.invertedX;
                let rotY = e.movementX * this.camRotSpeed * this.invertedY;

                if(rotX != 0.0)this.camera.rotation.x += rotX;
                if(rotY != 0.0)this.camera.rotation.y += rotY;
            }
        }
    }

    _handlerKeys(e)
    {
        let isKeyDown = (e.type == "keydown");
        let direction = [0.0, 0.0, 0.0];

        switch(e.code)
        {
            case "ArrowRight": 
            case "KeyD":
                this.camMoveDirection.x = isKeyDown ? 1.0 : 0.0;
                this.camMoveSpeed = this.camSpeed;
            break;

            case "ArrowLeft": 
            case "KeyA":
                this.camMoveDirection.x = isKeyDown ? -1.0 : 0.0;
                this.camMoveSpeed = this.camSpeed;
            break;

            case "ArrowUp": 
            case "KeyW":
                this.camMoveDirection.z = isKeyDown ? -1.0 : 0.0;
                this.camMoveSpeed = this.camSpeed;
            break;

            case "ArrowDown": 
            case "KeyS":
                this.camMoveDirection.z = isKeyDown ? 1.0 : 0.0;
                this.camMoveSpeed = this.camSpeed;
            break;

            case "KeyQ":
                this.camMoveDirection.y = isKeyDown ? -1.0 : 0.0;
                this.camMoveSpeed = this.camSpeed;
            break;
            case "KeyE":
                this.camMoveDirection.y = isKeyDown ? 1.0 : 0.0;
                this.camMoveSpeed = this.camSpeed;
            break;

        }
    }

    init()
    {
        for(let eventName of this.eventNamesKeys)
            this.eventNode.addEventListener(eventName, this._handlerKeysWrapper);

        for(let eventName of this.eventNamesMouse)
            this.eventNode.addEventListener(eventName, this._handlerMouseWrapper);

        this.camera.rotation.order = "YXZ";
    }

    update()
    {
        if(this.disabled)return;
        
        if(this.camMoveSpeed != 0.0)
        {
            this.camera.translateOnAxis(this.camMoveDirection, this.camMoveSpeed);
        }
    }

    enable()
    {
        super.enable();
        this.init();
        
    }

    disable()
    {
        super.disable();
        this.clear();
    }

    clear()
    {
        for(let eventName of this.eventNamesKeys)
            this.eventNode.removeEventListener(eventName, this._handlerKeysWrapper);

        for(let eventName of this.eventNamesMouse)
            this.eventNode.removeEventListener(eventName, this._handlerMouseWrapper);

        this.camera.rotation.order = this.oldEulerOrder;
    }
};
