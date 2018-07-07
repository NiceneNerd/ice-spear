/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

/**
 * class to hold actors models and the instanced data
 */
module.exports = class Actor_Object
{
    constructor(modelGroup)
    {
       this.modelGroup = modelGroup;
       this.modelMatrixArray = undefined;
       this.instances = new Map();
    }

    addInstance(instance)
    {
        this.instances.set(instance, instance);
    }

    removeInstance()
    {
        this.instances.delete(instance);
    }

    /**
     * updates the model-matrices based on the actor array
     * @param {Array<Actor>} actors 
     */
    update()
    {
        //@TODO check which values/array have changed and only update these
        console.warn("@TODO Actor_Object.update()");

        const bufferPos   = new Float32Array(this.instances.size * 3);
        const bufferRot   = new Float32Array(this.instances.size * 3);
        const bufferScale = new Float32Array(this.instances.size * 3);
        //const bufferColor = new Float32Array(this.instances.size * 4);

        let i=0;
        for(const instance of this.instances.values())
        {
            bufferPos.set(instance.bufferPos, i);
            bufferRot.set(instance.bufferRot, i);
            bufferScale.set(instance.bufferScale, i);
            //bufferColor.set(instance.bufferColor, i / 3 * 4);
            i += 3;
        }

        const posAttr   = new THREE.InstancedBufferAttribute(bufferPos,   3);
        const rotAttr   = new THREE.InstancedBufferAttribute(bufferRot,   3);
        const scaleAttr = new THREE.InstancedBufferAttribute(bufferScale, 3);
        //const colorAttr = new THREE.InstancedBufferAttribute(bufferColor, 4);

        for(let child of this.modelGroup.children)
        {
            child.geometry.addAttribute('objPos',   posAttr);
            child.geometry.addAttribute('objRot',   rotAttr);
            child.geometry.addAttribute('objScale', scaleAttr);
            //child.geometry.addAttribute('objColor', colorAttr);
        }
    }

    /**
     * check if this object has any instances or not
     * @returns {boolean}
     */
    isEmpty()
    {
        return this.instances.size == 0;
    }
};
