/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Renderer = requireGlobal("lib/3d_renderer/renderer");
const HTML_Loader = requireGlobal("lib/html_loader");
const Actor_GUI = require("./../actor/gui");

module.exports = class Shrine_Renderer
{
    /**
     * @param {Node} canvasNode canvas to draw to
     */
    constructor(canvasNode, uiNode)
    {
        this.canvasNode = canvasNode;
        this.uiNode = uiNode;
        this.clear();
    }
        
    clear()
    {
        if(this.renderer != null)
            this.renderer.clear();

        this.renderer = new Renderer(this.canvasNode);
        this.renderer.changeCameraType('fps');
        this.renderer.camera.position.y = 5;
        
        this.selectedActorList = this.uiNode.querySelector(".container-selectedActors");

        this.actorGroup  = this.renderer.createObjectGroup("actors",  true);
        this.shrineGroup = this.renderer.createObjectGroup("shrine",  true);

        this.htmlActorEntry = new HTML_Loader('./html/selected_actor.html');

        this.updateDrawSize();
    }

    /**
     * sets the model for the shrine
     * @param {Object} models 
     */
    setShrineModels(models)
    {
        for(const model of Object.values(models))
        {
            for(const subModel of Object.values(model))
            {
                this.shrineGroup.add(this.renderer.createModel(subModel));
            }
        }
    }

    addActor(actor)
    {
        const objectGroup = actor.object.getGroup();
        
        if(objectGroup)
            this.actorGroup.add(objectGroup);
    }

    /**
     * removes an actor from the scene
     * @param {Actor} actor actor to remove
     */
    deleteActor(actor)
    {
        if(actor.object)
            this.actorGroup.remove(actor.object.getGroup());
    }

    selectActor(actor)
    {
        let actorNode = this.htmlActorEntry.create();
        this.selectedActorList.appendChild(actorNode);
        actor.gui = new Actor_GUI(actor, this.selectedActorList.children[this.selectedActorList.children.length-1]);
        actor.gui.update();
    }

    deselectActor(actor)
    {
        if(actor.gui)
            this.selectedActorList.removeChild(actor.gui.node);
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
