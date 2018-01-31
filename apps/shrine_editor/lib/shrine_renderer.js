/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Renderer = requireGlobal("lib/threejs/renderer.js");

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
        if(this.threeJsRenderer != null)
            this.threeJsRenderer.clear();

        this.threeJsRenderer = new Renderer(this.canvasNode);
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
            this.shrineModels.push(this.threeJsRenderer.addModel(modelDataArray[i]));
        }
    }

    addActor(modelData, pos, rot)
    {
        //let actorModel = this.threeJsRenderer.addModel(modelData);
        let actorModel = this.threeJsRenderer.addBox();

        actorModel.position.copy(pos);

        actorModel.rotation.x = rot.x;
        actorModel.rotation.y = rot.y;
        actorModel.rotation.z = rot.z;

        return actorModel;
    }

    updateDrawSize()
    {
        this.threeJsRenderer.updateDrawSize();
    }

    start()
    {
        this.threeJsRenderer.start();
    }

    stop()
    {
        this.threeJsRenderer.stop();
    }
}
