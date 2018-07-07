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

        this.bufferPos   = new Float32Array(3);
        this.bufferRot   = new Float32Array(3);
        this.bufferScale = new Float32Array(3);
        //this.bufferColor = new Float32Array(4);
    }

    updatePos(pos)
    {
        this.bufferPos.set(pos);
        this.actorObject.update(); //@TODO do this only once per frame bundled
    }

    updateRot(rot)
    {
        this.bufferPos.set(rot);
        this.actorObject.update(); //@TODO do this only once per frame bundled
    }

    updateScale(scale)
    {
        this.bufferPos.set(scale);
        this.actorObject.update(); //@TODO do this only once per frame bundled
    }

    updateColor(color)
    {
        console.warn("@TODO: Actor_Object_Instance:setColor()");
        //this.bufferColor.set(color);
        //this.actorObject.update(); //@TODO do this only once per frame bundled
    }
};
