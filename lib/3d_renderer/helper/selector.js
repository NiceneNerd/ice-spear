/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Base = require("./base.js");
const KEYCODES = require("./../../keycodes.js");

module.exports = class Renderer_Helper_Selector extends Base
{
    constructor(threeContext, scene, camera, canvasNode)
    {
        super(threeContext);

        this.camera    = camera;
        this.scene     = scene;
        this.canvasNode  = canvasNode;
        this.eventNode = this.canvasNode;

        this.eventEmitter = [];
        this.raycaster = new THREE.Raycaster();    

        this.eventNamesMouse = ["mousemove", "mousedown", "mouseup"];
        this._handlerMouseWrapper = e => this._handlerMouse(e);

        this.mousePosNorm = new this.THREE.Vector2(0.0, 0.0);
        this.mouseDown = false;
        this.mouseMoved = false;
    }

    init()
    {
        for(let eventName of this.eventNamesMouse)
            this.eventNode.addEventListener(eventName, this._handlerMouseWrapper);
    }

    update()
    {
        if(this.disabled)return;

        if(!this.actorGroup)
            this.actorGroup = this.scene.getChildByName("actors");

        if(!this.shrineGroup)
            this.shrineGroup = this.scene.getChildByName("shrine");
    }

    /**
     * adds a handler function that recieves all events while selecting objects
     * @param {function} eventEmitter 
     */
    addEventEmitter(eventEmitter)
    {
        this.eventEmitter.push(eventEmitter);
    }

    _sendEvent(name, ...data)
    {
        for(const handler of this.eventEmitter)
        {
            handler.emit(name, ...data);
        }
    }

    _handlerMouse(e)
    {
        if(!this.actorGroup)
            return;

        if((e.buttons & KEYCODES.MOUSE.RIGHT) || e.type == "mouseup")
        {
            switch(e.type)
            {
                case "mousedown":
                    this.mouseDown = true;
                    this.mouseMoved = false;

                    this._sendEvent("start");
                    this._raycast(e, false);
                    
                break;

                case "mouseup":
                    if(this.mouseDown)
                    {
                        this._raycast(e, true);
                        this._sendEvent("end");
                    }

                    this.mouseDown = false;
                break;

                case "mousemove":
                    if(this.mouseDown)
                    {
                        this.mouseMoved = true;
                        this._sendEvent("move", e, this.camera);
                    }
                break;
            }
        }
    }

    _getCameraVec()
    {
        const lookAtVector = new THREE.Vector3(0,0, -1);
        lookAtVector.applyQuaternion(this.camera.quaternion);
        const planeVec = new this.THREE.Vector2(lookAtVector.x, lookAtVector.z);
        planeVec.normalize();
        return planeVec;
    }

    _raycast(e, isMouseUp)
    {
        const canvasRect = this.canvasNode.getBoundingClientRect();
        this.mousePosNorm.x = e.clientX - canvasRect.left;
        this.mousePosNorm.y = e.clientY - canvasRect.top;
        
        if(this.mousePosNorm.x >= 0 && this.mousePosNorm.x <= canvasRect.width &&
            this.mousePosNorm.y >= 0 && this.mousePosNorm.y <= canvasRect.height)
        {
            this.mousePosNorm.x =  (this.mousePosNorm.x / canvasRect.width)  * 2 - 1;
            this.mousePosNorm.y = -(this.mousePosNorm.y / canvasRect.height) * 2 + 1;

            this.raycaster.setFromCamera(this.mousePosNorm, this.camera);
            const intersects = this.raycaster.intersectObjects([...this.shrineGroup.children, ...this.actorGroup.children], true);
            
            if(isMouseUp || intersects.length > 0)
            {
                this._sendEvent("select", intersects, isMouseUp, this.mouseMoved);
            }
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
        for(let eventName of this.eventNamesMouse)
            this.eventNode.removeEventListener(eventName, this._handlerMouseWrapper);

        this.eventEmitter = [];
        this.actorGroup = null;
    }
};

