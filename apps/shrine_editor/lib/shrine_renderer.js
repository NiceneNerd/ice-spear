/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Renderer = requireGlobal("lib/3d_renderer/renderer.js");

module.exports = class Shrine_Renderer
{
    /**
     * @param {Node} canvasNode canvas to draw to
     */
    constructor(canvasNode)
    {
        this.canvasNode = canvasNode;
        this.clear();
    }
        
    clear()
    {
        if(this.renderer != null)
            this.renderer.clear();

        this.renderer = new Renderer(this.canvasNode);
        this.renderer.changeCameraType('fps');
        
        this.groupActorDynamic = this.renderer.createObjectGroup("actor_dynamic", true);
        this.groupActorStatic  = this.renderer.createObjectGroup("actor_static",  true);

        this.updateDrawSize();
        this.shrineModels = [];
    }

    /**
     * sets the model for the shrine
     * @param {Array} modelDataArray 
     */
    setShrineModels(modelDataArray)
    {
        for(let i in modelDataArray)
        {
            this.shrineModels.push(this.renderer.addModel(modelDataArray[i]));
        }
    }

    addActor(actor)
    {
        if(actor.object && actor.object.objectGroup)
            this.renderer.addObject(actor.object.objectGroup);
    }

    updateDrawSize()
    {
        this.renderer.updateDrawSize();
    }

    start()
    {
        this.renderer.start();
    }

    stop()
    {
        this.renderer.stop();
    }
}
