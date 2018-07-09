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
        this.eventEmitter.on("move",   (...data) => { this.eventActorMove(...data);     });
        this.eventEmitter.on("end", () => { this.actorAdded = false; });

        this.eventEmitter.on("select", (raycaster, castObjects, isMouseUp, mouseMoved) => 
        {
            // @TODO move this into a raycast class
            console.time("raycast");

            const hitInstances = [];

            var orgRay = new THREE.Ray();
            orgRay.copy(raycaster.ray);

            for(let obj of castObjects)
            {
                if(obj.userData.type == "actor" && obj.userData.actorObject)
                {
                    const actorObj = obj.userData.actorObject;
                    for(let entry of actorObj.instances)
                    {
                        const instance = entry[1];
                        const inverseMatrix = new THREE.Matrix4();
                        inverseMatrix.getInverse(instance.matrix);

                        raycaster.ray.copy(orgRay).applyMatrix4(inverseMatrix);

                        const intersects = raycaster.intersectObject(obj, true);
                        if(intersects.length > 0)
                        {
                            hitInstances.push(instance);
                        }
                    }
                }
            }
            console.timeEnd("raycast");
            if(isMouseUp || hitInstances.length > 0)
            {
                this.eventActorSelected(hitInstances, isMouseUp, mouseMoved);
            }
        });
    }

    update()
    {

    }

    async addActor(name, params)
    {        
        return await this.actorHandler.addActor(name, params);
    }

    eventActorSelected(actorInstances, isMouseUp, mouseMoved)
    {
        if(actorInstances.length == 0) 
        {
            if(!mouseMoved)
                this._resetSelection();
        }else{
            const actorInstance = actorInstances[0];
            const actor = actorInstance.actor;

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
        const speedScale  = 0.02;
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
                    x: 1.0 + Math.sign(moveVec.x) * speedScale,
                    z: 1.0 + Math.sign(moveVec.y) * speedScale,
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
        actor.setColor([1.0, 0.3, 0.3, 1.0]);
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
        actor.setColor([1.0, 1.0, 1.0, 1.0]);
        this.shrineRenderer.deselectActor(actor);
    }
};