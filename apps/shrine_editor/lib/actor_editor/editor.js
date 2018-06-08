module.exports = class Shrine_ActorEditor
{   
    /**
     * @param {Actor_Handler} actorHandler 
     */
    constructor(actorHandler)
    {
        this.actorHandler = actorHandler;
    }

    update()
    {

    }

    async addActor(name, params)
    {        
        const actor = await this.actorHandler.addActor(name, params);
    }
};