/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = class Actor
{
    constructor(name, id, object = undefined)
    {
        this.id = id;
        this.name = name;

        this.pos  = new THREE.Vector3(0.0, 0.0, 0.0);
        this.rot  = new THREE.Vector3(0.0, 0.0, 0.0);
        this.size = new THREE.Vector3(1.0, 1.0, 1.0);

        this.setObject(object);
    }

    setObject(object)
    {
        if(this.object)
            this.object.clear();

        this.object = object;
        this.update();
    }

    update()
    {
        this.object.setPos(this.pos);
        this.object.setRot(this.rot);
    }
};
