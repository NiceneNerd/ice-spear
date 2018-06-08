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
        
        this.actorGroup  = this.renderer.createObjectGroup("actors",  true);
        this.shrineGroup = this.renderer.createObjectGroup("shrine",  true);

        this.updateDrawSize();
    }

    /**
     * sets the model for the shrine
     * @param {Array} modelDataArray 
     */
    setShrineModels(modelDataArray)
    {
        for(let i in modelDataArray)
        {
            this.shrineGroup.add(this.renderer.createModel(modelDataArray[i]));
        }
    }

    addActor(actor)
    {
        const objectGroup = actor.object.getGroup();
        
        if(objectGroup)
            this.actorGroup.add(objectGroup);
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
