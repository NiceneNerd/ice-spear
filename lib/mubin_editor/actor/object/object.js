/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const ROTATION_ORDER = "ZYX";

/**
 * class to hold actors models and the instanced data
 */
module.exports = class Actor_Object
{
    constructor(models)
    {
       this.models = models;
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
    update(actors)
    {
        console.warn("@TODO Actor_Object.update()");
/*
        var offsetAttribute = new THREE.InstancedBufferAttribute( new Float32Array( offsets ), 3 );

        for(let child of this.objectGroup.children)
        {
            child.geometry.addAttribute( 'offset', offsetAttribute );
            child.frustumCulled = false;
        }
        */
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
