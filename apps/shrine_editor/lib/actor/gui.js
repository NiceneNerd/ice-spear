/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const { clipboard } = require('electron');

module.exports = class Actor_GUI
{
    constructor(actor, node)
    {
        this.actor = actor;
        this.node  = node;
    }

    update()
    {
        this.node.querySelector(".data-actor-name").innerHTML = this.actor.name;
        this.node.querySelector(".data-actor-type").innerHTML = this.actor.type;

        this.node.querySelector(".data-actor-params-HashId").value = this.actor.params.HashId.value;
        this.node.querySelector(".data-actor-params-HashId").onchange = (ev) => { this.actor.params.HashId.value = parseInt(ev.target.value); }

        this.node.querySelector(".data-actor-params-SRTHash").value = this.actor.params.SRTHash.value;
        this.node.querySelector(".data-actor-params-SRTHash").onchange = (ev) => { this.actor.params.SRTHash.value = parseInt(ev.target.value); }

        this.node.querySelector(".data-actor-params-UnitConfigName").value = this.actor.params.UnitConfigName.value;
        this.node.querySelector(".data-actor-params-UnitConfigName").onchange = (ev) => { this.actor.params.UnitConfigName.value = ev.target.value; }

        const modelTypeImg = this.actor.object.hasOwnModel ? "with-model.png" : "no-model.png";
        this.node.querySelector("img.actor-model-type").setAttribute("src", "assets/img/icons/actor/" + modelTypeImg);

        this.addTools();
    }

    addTools()
    {
        this.node.querySelector(".data-tool-copy").onclick = () => this.actor.copy();
        this.node.querySelector(".data-tool-delete").onclick = () => this.actor.delete();

        this.node.querySelector(".data-tool-copyJSON").onclick = () => {
            const json = this.actor.getParamJSON();
            clipboard.writeText(json);
            console.log(json);
        };
        this.node.querySelector(".data-tool-importJSON").onclick = () => {
            const json = clipboard.readText();
            this.actor.importParamJSON(json);
        };
    }
}