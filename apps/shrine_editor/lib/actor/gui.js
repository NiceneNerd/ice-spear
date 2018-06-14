/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const { clipboard } = require('electron');

module.exports = class Actor_GUI
{
    /**
     * @param {Actor} actor 
     * @param {Node} node 
     * @param {Loader} loader 
     */
    constructor(actor, node, loader)
    {
        this.actor = actor;
        this.node  = node;
        this.loader = loader;

        this._addCallbacks();
    }

    /**
     * updates the ui with the assigned actor
     */
    update()
    {
        this.node.querySelector(".data-actor-name").innerHTML = this.actor.getName();
        this.node.querySelector(".data-actor-type").innerHTML = this.actor.type;

        this.node.querySelector(".data-actor-params-HashId").value = this.actor.params.HashId.value;
        this.node.querySelector(".data-actor-params-HashId").onchange = (ev) => { this.actor.params.HashId.value = parseInt(ev.target.value); }

        this.node.querySelector(".data-actor-params-SRTHash").value = this.actor.params.SRTHash.value;
        this.node.querySelector(".data-actor-params-SRTHash").onchange = (ev) => { this.actor.params.SRTHash.value = parseInt(ev.target.value); }

        const modelTypeImg = this.actor.object.hasOwnModel ? "with-model.png" : "no-model.png";
        this.node.querySelector("img.actor-model-type").setAttribute("src", "assets/img/icons/actor/" + modelTypeImg);
    }

    _addCallbacks()
    {
        this.node.querySelector(".data-tool-copy").onclick = () => this.actor.copy();
        this.node.querySelector(".data-tool-delete").onclick = () => this.actor.delete();

        this.node.querySelector(".data-tool-addRotScalar").onclick = () => this.actor.addRotationParams(false);
        this.node.querySelector(".data-tool-addRotVector").onclick = () => this.actor.addRotationParams(true);

        this.node.querySelector(".data-tool-addScaleScalar").onclick = () => this.actor.addScalingParams(false);
        this.node.querySelector(".data-tool-addScaleVector").onclick = () => this.actor.addScalingParams(true);

        this.node.querySelector(".data-tool-removeRot").onclick = () => this.actor.removeRotationParams();
        this.node.querySelector(".data-tool-removeScale").onclick = () => this.actor.removeScalingParams();

        this.node.querySelector(".data-tool-copyJSON").onclick = () =>
        {
            const json = this.actor.getParamJSON();
            clipboard.writeText(json);
            console.log(json);
        };
        
        const importJsonNode = this.node.querySelector(".data-tool-importJSON");
        importJsonNode.onclick = async () => 
        {
            importJsonNode.style.opacity = 0.25;
            this.loader.show("Loading Actor");

            const json = clipboard.readText();
            await this.actor.importParamJSON(json);

            this.loader.hide();
            importJsonNode.style.opacity = 1.0;
        };
    }
}