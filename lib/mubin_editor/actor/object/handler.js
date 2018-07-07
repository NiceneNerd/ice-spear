/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Actor_Object_Instance = require('./instance');

module.exports = class Actor_Object_Handler
{
    constructor(actorObjLoader, mubinRenderer)
    {
        this.actorObjLoader = actorObjLoader;
        this.mubinRenderer = mubinRenderer;

        this.objectGroups = {};
    }

    async init()
    {
        await this.actorObjLoader.loadActorDatabase();
    }

    /**
     * creates an instance of an actor type object
     * if not already loaded, it also tries to load the model first
     * @param {*} name 
     */
    async createInstance(name)
    {
        let obj = this.objectGroups[name];
        if(!obj)
        {
            obj = await this.actorObjLoader.getObject(name);
            if(!obj) 
            {
                console.warn(`Actor_Object_Handler.createInstance(): unknown actor type: ${name}`);
                return undefined;
            }
            this.objectGroups[name] = obj;
            this.mubinRenderer.addActor(obj);
        }

        const instance = new Actor_Object_Instance(obj);
        obj.addInstance(instance);
        return instance;
    }

    /**
     * removes an instance from the list
     * if all instances of an actor type are gone, the mesh is removed from the scene
     * @param {*} instance 
     */
    deleteInstance(actorType, instance)
    {
        
    }
}