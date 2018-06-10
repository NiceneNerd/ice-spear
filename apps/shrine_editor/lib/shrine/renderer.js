/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Renderer = requireGlobal("lib/3d_renderer/renderer.js");
const HTML_Loader = requireGlobal("lib/html_loader.js");

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

    selectActor(actor)
    {
        let actorNode = this.htmlActorEntry.create();
        this.selectedActorList.appendChild(actorNode);
        actor.ui = this.selectedActorList.children[this.selectedActorList.children.length-1];
        this.updateActorUI(actor);
    }

    deselectActor(actor)
    {
        if(actor.ui)
            this.selectedActorList.removeChild(actor.ui);
    }

    updateActorUI(actor)
    {
        if(!actor.ui)
            return;

        actor.ui.querySelector(".data-actor-name").innerHTML = actor.name;
        actor.ui.querySelector(".data-actor-type").innerHTML = actor.type;

        actor.ui.querySelector(".data-actor-params-HashId").value = actor.params.HashId.value;
        actor.ui.querySelector(".data-actor-params-HashId").onchange = (ev) => { actor.params.HashId.value = parseInt(ev.target.value); }

        actor.ui.querySelector(".data-actor-params-SRTHash").value = actor.params.SRTHash.value;
        actor.ui.querySelector(".data-actor-params-SRTHash").onchange = (ev) => { actor.params.SRTHash.value = parseInt(ev.target.value); }

        actor.ui.querySelector(".data-actor-params-UnitConfigName").value = actor.params.UnitConfigName.value;
        actor.ui.querySelector(".data-actor-params-UnitConfigName").onchange = (ev) => { actor.params.UnitConfigName.value = ev.target.value; }

        const modelTypeImg = actor.object.hasOwnModel ? "with-model.png" : "no-model.png";
        actor.ui.querySelector("img.actor-model-type").setAttribute("src", "assets/img/icons/actor/" + modelTypeImg);
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
