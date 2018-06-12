module.exports = class Actor_Editor
{   
    /**
     * @param {Actor_Handler} actorHandler 
     */
    constructor(shrineRenderer, actorHandler)
    {
        this.actorHandler = actorHandler;
        this.shrineRenderer = shrineRenderer;

        this.selectedActors = [];
        this.actorAdded = false;

        this.eventEmitter = this.shrineRenderer.renderer.getSelectorEventEmitter();
        this.eventEmitter.on("select", (...data) => { this.eventActorSelected(...data); });
        this.eventEmitter.on("move",   (...data) => { this.eventActorMove(...data);     });

        this.eventEmitter.on("end", () => { this.actorAdded = false; });
    }

    update()
    {

    }

    async addActor(name, params)
    {        
        return await this.actorHandler.addActor(name, params);
    }

    eventActorSelected(objects, isMouseUp, mouseMoved)
    {
        if(objects.length == 0) 
        {
            this._resetSelection();
        }else{
            const selObj = objects[0];
            const actor = this._findActorByModel(selObj.object);

            if(actor)
            {
                if(!isMouseUp)
                {
                    if(!this.selectedActors.includes(actor))
                    {
                        this._addToSelection(actor);
                    }
                }else if(!mouseMoved && !this.actorAdded && this.selectedActors.includes(actor))
                {
                    this.deselectActor(actor);    
                }
            }
            else if(isMouseUp && !mouseMoved)
            {
                this._resetSelection();
            }
        }
    }

    // @TODO refactor here, general logic for direction and scaling
    eventActorMove(ev, camera)
    {
        if(this.selectedActors.length == 0)
            return;

        const speedMulti  = 0.02;
        const speedScale  = 0.1;
        const scrollMulti = 0.002;

        let speedVec;

        if(ev.ctrlKey) // scaling
        {
            if(ev.type == "wheel")
            {
                speedVec = { y: 1.0 + (ev.deltaY < 0 ? speedScale : -speedScale) };
            }else{
                const moveVec = new THREE.Vector2(ev.movementX, -ev.movementY);
                speedVec = {
                    x: 1.0 + (moveVec.x >= 0 ? speedScale : -speedScale),
                    z: 1.0 + (moveVec.y >= 0 ? speedScale : -speedScale),
                };
            }

        }else{ // moving / rotating
            if(ev.type == "wheel")
            {
                speedVec = { y: -ev.deltaY * scrollMulti };
            }else{
                const moveVec = new THREE.Vector2(ev.movementX, -ev.movementY);            
                moveVec.rotateAround(new THREE.Vector2(0.0, 0.0), camera.rotation.y % (Math.PI * 2));

                speedVec = {
                    x: moveVec.x * speedMulti,
                    z: -moveVec.y * speedMulti
                };
            }
        }
        
        for(const actor of this.selectedActors)
        {
            if(ev.shiftKey) // rotating
            {
                actor.rotate(speedVec);
            }else if(ev.ctrlKey) // scaling
            {
                actor.scale(speedVec);
            }else{ // moving
                actor.move(speedVec);
            }
        }
    }

    _resetSelection()
    {
        for(const actor of this.selectedActors)
            this._removeActorSelection(actor);

        this.selectedActors = [];
    }

    _addToSelection(actor)
    {
        console.log(actor);

        this.selectedActors.push(actor);
        actor.object.setColor(0xff4444);
        this.actorAdded = true;

        this.shrineRenderer.selectActor(actor);
    }

    deselectActor(actor)
    {
        const idx = this.selectedActors.indexOf(actor);
        if(idx > -1) 
        {
            this.selectedActors.splice(idx, 1);
            this._removeActorSelection(actor);
        }
    }

    _removeActorSelection(actor)
    {
        actor.object.setColor(0xFFFFFF);   
        this.shrineRenderer.deselectActor(actor);
    }

    /**
     * scans through all parent elements until a actor was found or the end was reached
     * @param {*} model 
     * @returns {Actor|undefined}
     */
    _findActorByModel(model) // @TODO move actor logic out of here
    {
        if(model.userData && model.userData.actor)
            return model.userData.actor;
        
        if(model.parent)
            return this._findActorByModel(model.parent);
    }
};