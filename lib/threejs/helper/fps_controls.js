/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Base = require("./base.js");

module.exports = class Renderer_Helper_FPS_Controls extends Base
{
    constructor(threeContext, camera)
    {
        super(threeContext);

        this.camera = camera;
        this.eventNode = document;

        this.oldEulerOrder = this.camera.eulerOrder;

        this.eventNamesKeys  = ["keydown", "keyup"];
        this.eventNamesMouse = ["mousemove", "mousedown", "mouseup"];

        this._handlerMouseWrapper = e => this._handlerMouse(e);
        this._handlerKeysWrapper  = e => this._handlerKeys(e);

        this.camSpeed = 0.125;
        this.camRotSpeed = 0.005;

        this.camMoveDirection = new this.THREE.Vector3(0.0, 0.0, 0.0);
        this.camMoveSpeed = 0.0;

        this.mouseDown = false;
    }
    
    _handlerMouse(e)
    {
        if(e.type != "mousemove")
        {
            this.mouseDown = e.type == "mousedown";
        }
        else if(this.mouseDown)
        {
            let rotX = e.movementY * this.camRotSpeed;
            let rotY = e.movementX * -this.camRotSpeed;

            if(rotX != 0.0)this.camera.rotation.x += rotX;
            if(rotY != 0.0)this.camera.rotation.y += rotY;
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

        this.camera.eulerOrder = "YXZ";

        /*
        this.camera.position.z = -10;
        this.tanFOV = Math.tan( ( ( Math.PI / 180 ) * this.camera.fov / 2 ) );
        this.camera.lookAt(new this.THREE.Vector3(0.0));
        */
    }

    update()
    {
        if(this.camMoveSpeed != 0.0)
        {
            this.camera.translateOnAxis(this.camMoveDirection, this.camMoveSpeed);
        }
    }

    clear()
    {
        for(let eventName of this.eventNamesKeys)
            this.eventNode.removeEventListener(eventName, this._handlerKeysWrapper);

        for(let eventName of this.eventNamesMouse)
            this.eventNode.removeEventListener(eventName, this._handlerMouseWrapper);

        this.camera.eulerOrder = this.oldEulerOrder;
    }
};
