/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const BYAML = require("byaml-lib");

module.exports = class Actor
{
    constructor(name, params, type, id, object = undefined)
    {
        this.id = id;
        this.params = params;
        this.type = type;
        this.name = name;
        this.gui = null;

        this.setObject(object);
    }

    setHandler(handler)
    {
        this.handler = handler;
    }

    setObject(object)
    {
        if(this.object)
            this.object.clear();

        this.object = object;
        this.object.setActor(this);

        this.update();
    }

    copy()
    {
        if(this.handler)
            this.handler.copyActor(this);
    }

    getParamJSON() 
    {
        return BYAML.Helper.toJSON(this.params);
    }

    importParamJSON(jsonString) 
    {
        const oldParams = this.params;

        let newParams;
        try{
            newParams = BYAML.Helper.fromJSON(jsonString);
        } catch(e) {
            console.warn("Import Actor JSON, invalid JSON!");  
            console.warn(jsonString);
        }

        this.handler.assignNewActorParams(this, newParams);

        this.params.HashId.value = oldParams.HashId.value;
        if(this.params.Translate && oldParams.Translate)
        {
            this.setPos({
                x: oldParams.Translate[0].value,
                y: oldParams.Translate[1].value,
                z: oldParams.Translate[2].value,
            });
        }

        this.update();
    }

    delete()
    {
        if(this.handler)
            this.handler.deleteActor(this);
    }

    update()
    {
        const {Rotate, Translate} = this.params;

        if(Translate)
        {
            this.object.setPos(new THREE.Vector3(Translate[0].value, Translate[1].value, Translate[2].value));
        }

        if(this.params.Rotate)
        {
            if(Array.isArray(this.params.Rotate))
                this.object.setRot(new THREE.Vector3(Rotate[0].value, Rotate[1].value, Rotate[2].value));
            else
                this.object.setRot(new THREE.Vector3(0.0, Rotate.value, 0.0));
        }

        if(this.params.Scale)
        {
            const Scale = this.params.Scale;
            if(Array.isArray(Scale))
                this.object.setScale(new THREE.Vector3(Scale[0].value, Scale[1].value, Scale[2].value));
            else
                this.object.setScale(new THREE.Vector3(Scale.value, Scale.value, Scale.value));
        }
    }

    move({x = 0.0, y = 0.0, z = 0.0})
    {
        if(this.params.Translate)
        {
            this.params.Translate[0].value += x;
            this.params.Translate[1].value += y;
            this.params.Translate[2].value += z;
        }
        this.update();
    }

    setPos({x = 0.0, y = 0.0, z = 0.0})
    {
        if(this.params.Translate)
        {
            this.params.Translate[0].value = x;
            this.params.Translate[1].value = y;
            this.params.Translate[2].value = z;
        }
        this.update();
    }

    rotate({x = 0.0, y = 0.0, z = 0.0})
    {
        if(this.params.Rotate)
        {
            if(Array.isArray(this.params.Rotate))
            {
                this.params.Rotate[0].value += x;
                this.params.Rotate[1].value += y;
                this.params.Rotate[2].value += z;
            }else{
                this.params.Rotate.value += y;
            }
        }
        this.update();
    }

    scale({x = 1.0, y = 1.0, z = 1.0})
    {
        if(this.params.Scale)
        {
            if(Array.isArray(this.params.Scale))
            {
                this.params.Scale[0].value += x;
                this.params.Scale[1].value += y;
                this.params.Scale[2].value += z;
            }else{
                this.params.Scale.value += x || y || z || 0.0;
            }
        }
    }
};
