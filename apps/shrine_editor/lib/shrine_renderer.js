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
        this.threeJsRenderer = new Renderer(canvasNode);
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

    addActor(modelData, pos)
    {
        //let actorModel = this.threeJsRenderer.addModel(modelData);
        let actorModel = this.threeJsRenderer.addBox();
        actorModel.position.x = pos.x;
        actorModel.position.y = pos.y;
        actorModel.position.z = pos.z;
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
