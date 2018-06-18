/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const ROTATION_ORDER = "ZYX";

module.exports = class Actor_Object
{
    constructor(shrineRenderer, models = undefined)
    {
        this.shrineRenderer = shrineRenderer;
        this.renderer = this.shrineRenderer.renderer;
        this.hasOwnModel = false;

        this.objectGroup = this.renderer.createObjectGroup("actor_object");
        this.objectGroup.rotation.order = ROTATION_ORDER;

        if(models)
            this._createModels(models);
    }

    clear()
    {
        //@TODO remove from scene
    }

    _createModels(models)
    {
        for(let subModel of Object.values(models))
        {
            this.objectGroup.add(this.renderer.createModel(subModel));
        }
        this.hasOwnModel = true;
    }

    getGroup()
    {
        return this.objectGroup;
    }

    setThreeModel(model)
    {
        this.objectGroup.add(model);
    }

    createInstance()
    {
        const obj = new Actor_Object(this.shrineRenderer);
        obj.objectGroup = this._cloneObjects(this.objectGroup);
        obj.objectGroup.rotation.order = ROTATION_ORDER;
        obj.hasOwnModel = this.hasOwnModel;
        return obj;
    }

    setActor(actor)
    {
        this.objectGroup.userData = {actor};
    }

    setPos(pos)
    {
        this.objectGroup.position.copy(pos);
    }

    setRot(rot)
    {
        this.objectGroup.rotation.x = rot.x; // copy doesn't work here
        this.objectGroup.rotation.y = rot.y;
        this.objectGroup.rotation.z = rot.z;
    }

    setScale(scale)
    {
        this.objectGroup.scale.x = scale.x; // copy doesn't work here
        this.objectGroup.scale.y = scale.y;
        this.objectGroup.scale.z = scale.z;
    }

    setColor(color, obj = this.objectGroup)
    {
        if(obj.children.length > 0)
        {
            for(let child of obj.children)
                this.setColor(color, child);
        }else if(obj.material && obj.material.color){
            obj.material.color.set(color);
        }
    }

    _cloneObjects(obj)
    {
        const clone = obj.clone();

        if(clone.children.length > 0)
        {
            for(const i in clone.children)
            {
                clone.children[i].material = clone.children[i].material.clone();
            }
        }

        return clone;
    }
};
