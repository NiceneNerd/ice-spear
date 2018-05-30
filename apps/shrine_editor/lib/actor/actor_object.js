/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const ROTATION_ORDER = "YXZ";

module.exports = class Actor_Object
{
    constructor(shrineRenderer, models = undefined)
    {
        this.shrineRenderer = shrineRenderer;
        this.renderer = this.shrineRenderer.renderer;
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
        for(let modelName in models)
        {
            const subModelGroup = this.renderer.createObjectGroup(modelName);
            subModelGroup.visible = true;

            Object.values(models[modelName]).forEach(subModel => {
                subModelGroup.add(this.renderer.createModel(subModel));
            });

            this.objectGroup.add(subModelGroup);
        }

        console.log(this.objectGroup);
    }

    createInstance()
    {
        const obj = new Actor_Object(this.shrineRenderer);
        obj.objectGroup = this.objectGroup.clone();
        obj.objectGroup.rotation.order = ROTATION_ORDER;
        return obj;
    }

    showModel(name)
    {
        //console.log(this.objectGroup);
    }

    setPos(pos)
    {
        this.objectGroup.position.copy(pos);
    }

    setRot(rot)
    {
        this.objectGroup.rotation.x = rot.x;
        this.objectGroup.rotation.y = rot.y;
        this.objectGroup.rotation.z = rot.z;
    }
};


//actorGroup.add(this.renderer.createBox());
