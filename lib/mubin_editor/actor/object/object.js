/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const MATRIX_SIZE = 4 * 4;

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

       // why is it 4 different buffers? because for some reason i can't send instanced matrix data to the shader
       this.bufferMatrix = new Array(4);
       this._updateBufferSize(0);

       this.attrMatrix = new Array(4);
       this._updateAttributes();

       this.currentInstances = 0;
    }

    addInstance(instance)
    {
        this.instances.set(instance, instance);
    }

    removeInstance()
    {
        this.instances.delete(instance);
    }

    _updateBufferSize(newSize)
    {
        this.bufferMatrix[0] = new Float32Array(newSize * 4);
        this.bufferMatrix[1] = new Float32Array(newSize * 4);
        this.bufferMatrix[2] = new Float32Array(newSize * 4);
        this.bufferMatrix[3] = new Float32Array(newSize * 4);
    }

    _updateAttributes()
    {
        this.attrMatrix[0] = new THREE.InstancedBufferAttribute(this.bufferMatrix[0], 4);
        this.attrMatrix[1] = new THREE.InstancedBufferAttribute(this.bufferMatrix[1], 4);
        this.attrMatrix[2] = new THREE.InstancedBufferAttribute(this.bufferMatrix[2], 4);
        this.attrMatrix[3] = new THREE.InstancedBufferAttribute(this.bufferMatrix[3], 4);
    }

    /**
     * updates the model-matrices based on the actor array
     * @param {Array<Actor>} actors 
     */
    update()
    {
        //@TODO check which values/array have changed and only update these
        if(this.instanceCount != this.instances.size)
        {
            this.instanceCount = this.instances.size;
            this._updateBufferSize(this.instanceCount);
        }

        let i=0;
        for(const instance of this.instances.values())
        {
            this.bufferMatrix[0].set(instance.bufferMatrix.slice(0, 4), i);
            this.bufferMatrix[1].set(instance.bufferMatrix.slice(4, 8), i);
            this.bufferMatrix[2].set(instance.bufferMatrix.slice(8, 12), i);
            this.bufferMatrix[3].set(instance.bufferMatrix.slice(12, 16), i);
            i += 4;
        }

        this._updateAttributes();

        for(let child of this.modelGroup.children)
        {
            child.geometry.addAttribute('objMatrix0', this.attrMatrix[0]);
            child.geometry.addAttribute('objMatrix1', this.attrMatrix[1]);
            child.geometry.addAttribute('objMatrix2', this.attrMatrix[2]);
            child.geometry.addAttribute('objMatrix3', this.attrMatrix[3]);
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
