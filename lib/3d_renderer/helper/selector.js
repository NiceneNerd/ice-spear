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
        this.eventNode = this.canvasNode;

        this.raycaster = new THREE.Raycaster();    

        this.eventNamesMouse = ["mousemove", "mousedown", "mouseup"];
        this._handlerMouseWrapper = e => this._handlerMouse(e);

        this.mousePosNorm = new this.THREE.Vector2(0.0, 0.0);
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
    }

    _handlerMouse(e)
    {
        if(e.type == "mousemove" && this.actorGroup)
        {
            let canvasRect = this.canvasNode.getBoundingClientRect();
            this.mousePosNorm.x = e.clientX - canvasRect.left;
            this.mousePosNorm.y = e.clientY - canvasRect.top;
            
            if(this.mousePosNorm.x >= 0 && this.mousePosNorm.x <= canvasRect.width &&
                this.mousePosNorm.y >= 0 && this.mousePosNorm.y <= canvasRect.height)
            {
                this.mousePosNorm.x =  (this.mousePosNorm.x / canvasRect.width)  * 2 - 1;
                this.mousePosNorm.y = -(this.mousePosNorm.y / canvasRect.height) * 2 + 1;

                this.raycast();
            }
        }
    }

    raycast()
    {
        this.raycaster.setFromCamera(this.mousePosNorm, this.camera);
        const intersects = this.raycaster.intersectObjects(this.actorGroup.children, true);
        
        for(let selObj of intersects) 
        {
            const actor = this._findActorByModel(selObj.object);
            if(actor)
            {
                console.log(actor);
                if(actor.object)
                {
                    actor.object.setColor(0xff0000);
                    setTimeout(() => actor.object.setColor(0xFFFFFF), 20);
                }

                return;
            }
        }
    }

    /**
     * scans through all parent elements until a actor was found or the end was reached
     * @param {*} model 
     * @returns {Actor|undefined}
     */
    _findActorByModel(model)
    {
        if(model.userData && model.userData.actor)
            return model.userData.actor;
        
        if(model.parent)
            return this._findActorByModel(model.parent);
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

        this.actorGroup = null;
    }
};

