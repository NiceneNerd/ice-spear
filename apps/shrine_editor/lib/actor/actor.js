/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = class Actor
{
    constructor(name, params, type, id, object = undefined)
    {
        this.id = id;
        this.params = params;
        this.type = type;
        this.name = name;
        this.ui = null;

        this.setObject(object);
    }

    setObject(object)
    {
        if(this.object)
            this.object.clear();

        this.object = object;
        this.object.setActor(this);

        this.update();
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
};
