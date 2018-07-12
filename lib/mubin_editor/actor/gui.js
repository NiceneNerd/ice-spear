/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const { clipboard } = require('electron');
const ace = require("ace-builds");
const QuerySelector_Cache = require("./../../queryselector_chache");

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
        this.editor = undefined;

        this.nodeCache = new QuerySelector_Cache(this.node);

        const acePath =  __BASE_PATH + "node_modules/ace-builds/src-noconflict";
        ace.config.set('basePath', acePath);
        ace.config.set('modePath', acePath);
        ace.config.set('themePath', acePath);

        this.editorNode = this.node.querySelector(".byaml-editor");
        
        this._addCallbacks();
    }

    /**
     * updates the ui with the assigned actor
     */
    update()
    {
        this.nodeCache.querySelector(".data-actor-name").innerHTML = this.actor.getName();
        this.nodeCache.querySelector(".data-actor-type").innerHTML = this.actor.type;

        this.nodeCache.querySelector(".data-actor-params-HashId").value = this.actor.params.HashId.value;
        this.nodeCache.querySelector(".data-actor-params-SRTHash").value = this.actor.params.SRTHash.value;
    
        const modelTypeImg = this.actor.isInvisible() ? "with-model.png" : "no-model.png";
        this.nodeCache.querySelector("img.actor-model-type").setAttribute("src", "assets/img/icons/actor/" + modelTypeImg);

        this.updateEditor();
    }

    _addCallbacks()
    {
        this.nodeCache.querySelector(".data-actor-params-SRTHash").onchange = (ev) => { 
            this.actor.params.SRTHash.value = parseInt(ev.target.value);
            this.update();
        };

        this.nodeCache.querySelector(".data-actor-params-HashId").onchange = (ev) => { 
            this.actor.params.HashId.value = parseInt(ev.target.value); 
            this.update();
        };

        this.nodeCache.querySelector(".data-tool-copy").onclick = () => this.actor.copy();
        this.nodeCache.querySelector(".data-tool-delete").onclick = () => this.actor.delete();

        this.nodeCache.querySelector(".data-tool-addRotScalar").onclick = () => this.actor.addRotationParams(false);
        this.nodeCache.querySelector(".data-tool-addRotVector").onclick = () => this.actor.addRotationParams(true);

        this.nodeCache.querySelector(".data-tool-addScaleScalar").onclick = () => this.actor.addScalingParams(false);
        this.nodeCache.querySelector(".data-tool-addScaleVector").onclick = () => this.actor.addScalingParams(true);

        this.nodeCache.querySelector(".data-tool-removeRot").onclick = () => this.actor.removeRotationParams();
        this.nodeCache.querySelector(".data-tool-removeScale").onclick = () => this.actor.removeScalingParams();

        this.nodeCache.querySelector(".data-tool-copyJSON").onclick = () =>
        {
            const json = this.actor.getParamJSON();
            clipboard.writeText(json);
        };
        
        this.nodeCache.querySelector(".data-tool-importJSON").onclick = () => this._importJSON(clipboard.readText(), true);

        this.nodeCache.querySelector(".data-tool-toggleEditor").onclick = () => {

            const iconNode = this.nodeCache.querySelector(".data-tool-toggleEditor span");
            if(this.editor)
            {
                this.hideEditor();
                iconNode.setAttribute("class", "icon icon-right-open");
            }else{
                this.showEditor();
                iconNode.setAttribute("class", "icon icon-down-open");
            }
        };

        this.nodeCache.querySelector(".data-tool-byamlToActor").onclick = () => this._editorJsonToActor();
        this.nodeCache.querySelector(".data-tool-byamlRefresh").onclick = () => this.update();
    }

    async _editorJsonToActor()
    {
        if(this.editor)
        {
            const jsonString = this.editor.getValue();
            await this._importJSON(jsonString, false);
        }
    }

    async _importJSON(jsonString, keepPosition) 
    {
        this.loader.show("Loading Actor");
        await this.actor.importParamJSON(jsonString, keepPosition);
        this.loader.hide();
    }

    showEditor()
    {
        if(this.editor)
            this.hideEditor();

        this.editorNode.hidden = false;
        this.editor = ace.edit(this.editorNode);
        this.editor.setTheme("ace/theme/tomorrow_night");
        this.editor.getSession().setMode("ace/mode/json");
        this.editor.setOption("showInvisibles", true);
        this.updateEditor();
    }

    hideEditor()
    {
        if(this.editor)
        {
            this.editor.destroy();
            this.editor = undefined;
        }

        this.editorNode.hidden = true;
        this.editorNode.innerHTML = "";
        this.editorNode.parentNode.replaceChild(this.editorNode.cloneNode(false), this.editorNode);
        this.editorNode = this.node.querySelector(".byaml-editor");
    }

    updateEditor()
    {
        if(this.editor)
        {
            this.editor.setValue(this.actor.getParamJSON());
            this.editor.selection.clearSelection();
        }
    }

    delete()
    {
        this.hideEditor();
    }
}