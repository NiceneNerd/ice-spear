/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = class Actor_Object_Handler
{
    constructor()
    {
        this.objects = {};
    }

    /**
     * creates an instance of an actor type object
     * if not already loaded, it also tries to load the model first
     * @param {*} actorType 
     */
    async createInstance(actorType)
    {

    }

    /**
     * removes an instance from the list
     * if all instances of an actor type are gone, the mesh is removed from the scene
     * @param {*} instance 
     */
    deleteInstance(actorType, instance)
    {

    }

    /**
     * updates all instances of an actor type
     * @param {*} actorType 
     */
    update(actorType)
    {

    }
}