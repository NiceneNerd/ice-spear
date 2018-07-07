/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const ROTATION_ORDER = "ZYX";

module.exports = class Actor_Object_Instance
{
    constructor(actorObject)
    {
        this.matrix = new THREE.Matrix4();
        this.actorObject = actorObject;

        this.bufferPos   = new Float32Array([0,0,0]);
        this.bufferRot   = new Float32Array([0,0,0]);
        this.bufferScale = new Float32Array([1,1,1]);
        this.bufferColor = new Float32Array([1,1,1]);
    }

    setPos(pos)
    {
        this.bufferPos.set(pos);
    }

    setRot(rot)
    {
        this.bufferRot.set(rot);
    }

    setScale(scale)
    {
        this.bufferScale.set(scale);
    }

    setColor(color)
    {
        this.bufferColor.set(color);
    }

    update()
    {
        this.actorObject.update(); //@TODO do this only once per frame bundled
    }
};
