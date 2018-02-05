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

    addActor(actorData, pos, rot)
    {
        let actorModel = null;

        if(actorData && actorData.bfresParser)
        {
            // @TODO create an actor class which handles all of this better
            let models = actorData.bfresParser.getModels();
            for(let subModel of models)
            {
                for(let i in subModel)
                {
                    let actorModel_ = this.threeJsRenderer.addModel(subModel[i]); // @TODO CREATE MESH ONLY ONCE!
                    actorModel_.rotation.order = "YXZ";
                    actorModel_.position.copy(pos);
            
                    actorModel_.rotation.x = rot.x;
                    actorModel_.rotation.y = rot.y;
                    actorModel_.rotation.z = rot.z;
                }
            }
        }else{
            actorModel = this.threeJsRenderer.addBox();
        }

        if(actorModel != null)
        {
            actorModel.rotation.order = "YXZ";
            actorModel.position.copy(pos);

            actorModel.rotation.x = rot.x;
            actorModel.rotation.y = rot.y;
            actorModel.rotation.z = rot.z;
        }

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
