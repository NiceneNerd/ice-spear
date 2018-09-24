/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const HTML_Loader = require("./../../../html_loader");
const Draggable = require('draggable');

module.exports = class Actor_Search_GUI
{
    constructor(uiNode, actorFinder)
    {
        this.actorFinder = actorFinder;
        this.windowNode = undefined;

        this.filter = {};
        this.searchValue = "";

        this._createView(uiNode);
        this._initFilters();
        this._initActions();

        this.resultNode = uiNode.querySelector(".data-resultTable");
    }

    /**
     * loads and creates the HTML template
     * @param {HTMLElement} uiNode target to append to
     */
    _createView(uiNode)
    {
        const actorSearchHtml = new HTML_Loader('html/actor_search.html');
        uiNode.appendChild(actorSearchHtml.create());

        this.windowNode = uiNode.querySelector("#searchWindow-actor");
        
        this.dragObj = new Draggable(this.windowNode, {
            filterTarget: (target) => target.classList.contains("drag-bar"),
            onDragStart: () => this.windowNode.classList.add("isMoving"),
            onDragEnd: () => this.windowNode.classList.remove("isMoving"),
            useGPU: true
        });
    }

    /**
     * triggers a search action
     */
    _triggerSearch()
    {
        const result = this.actorFinder.search(this.searchValue, this.filter);
        
        this.resultNode.innerHTML = result.reduce((resultHtml, actor) => {
            return resultHtml + `<tr>
                <td>${actor.getName()}</td>
                <td>${actor.getHashId()}</td>
                <td>${actor.getSRTHash()}</td>
                <td>${actor.type}</td>
            </tr>`;
        }, "");
    }

    /**
     * initializes filter callbacks and arrays
     */
    _initFilters()
    {
        const filterNodes = this.windowNode.querySelectorAll("button[data-filter]");
        for(let node of filterNodes) 
        {
            const filterName = node.getAttribute("data-filter");
            this.filter[filterName] = node.classList.contains("active");

            node.onclick = () => {
                if(this.filter[filterName] = !this.filter[filterName]) {
                    node.classList.add("active");
                }else{
                    node.classList.remove("active");
                }
                this._triggerSearch();
            };
        } 

        this.windowNode.querySelector(".data-searchValue").onkeyup = (ev) => {
            this.searchValue = ev.target.value;
            this._triggerSearch();
        };
    }

    /**
     * inits actions-buttons
     */
    _initActions()
    {
        this.windowNode.querySelector(".data-tool-selectAll").onclick = () => this.actorFinder.selectAll();
    }
};