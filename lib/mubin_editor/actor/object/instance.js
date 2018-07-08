/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const ROTATION_ORDER = "ZYX";
const MATRIX_SIZE = 4 * 4;

module.exports = class Actor_Object_Instance
{
    constructor(actorObject)
    {
        this.matrix = new THREE.Matrix4();
        this.actorObject = actorObject;

        this.pos = new THREE.Vector3(0.0, 0.0, 0.0);
        this.rot = new THREE.Vector3(0.0, 0.0, 0.0);
        this.scale = new THREE.Vector3(1.0, 1.0, 1.0);

        this.bufferColor = new Float32Array([1.0, 1.0, 1.0, 1.0]);
        this.bufferMatrix = new Float32Array(MATRIX_SIZE);

        this.hasChanged = false;
    }

    setPos(pos)
    {
        this.pos.fromArray(pos);
        this.hasChanged = true;
    }

    setRot(rot)
    {
        this.rot.fromArray(rot);
        this.hasChanged = true;
    }

    setScale(scale)
    {
        this.scale.fromArray(scale);
        this.hasChanged = true;
    }

    setColor(color)
    {
        this.bufferColor.set(color);
        this.hasChanged = true;
    }

    update()
    {
        if(!this.hasChanged)return;
        const quat = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(this.rot.x, this.rot.y, this.rot.z, ROTATION_ORDER
        ));

        this.matrix.compose(this.pos, quat, this.scale);
        this.bufferMatrix.set(this.matrix.elements);

        this.actorObject.update(); //@TODO do this only once per frame bundled
        this.hasChanged = false;
    }
};
