const fs = require("fs");

const HTML_Loader = require("./html_loader.js");
const BFRES_FileTypes = require("./../bfres/file_types.js");

module.exports = class Tab_Manager
{
    constructor(nodeTabs, nodeContent)
    {
        this.nodeContent = nodeContent;
        this.nodeTabs    = nodeTabs;
        this.inputSearch = this.nodeTabs.querySelector(".list-group-header input");
    }

    clear()
    {
        this.nodeContent.innerHTML = "";

        let listGroup = this.nodeTabs.querySelector(".list-group");
        let listItems = this.nodeTabs.querySelectorAll(".list-group-item");

        for(let item of listItems)
            this.nodeTabs.removeChild(item);
    }

    init()
    {
        let that = this;
        this.inputSearch.onkeyup = function(ev)
        {
            that.filterTabs(this.value);
        };
    }

    filterTabs(text)
    {
        text = text.toLowerCase();
        let items = this.nodeTabs.querySelectorAll(".list-group-item");
        for(let item of items)
        {
            item.hidden = text != "";

            if(text == "")
                continue;

            let searchItems = item.querySelectorAll(".search-value");
            for(let searchItem of searchItems)
            {
                if(searchItem.innerHTML.toLowerCase().search(text) >= 0)
                {
                    item.hidden = false;
                    break;
                }
            }
        }
    }

    getTab(tabId)
    {
        return this.nodeContent.querySelector("#tab_content_" + tabId);
    }

    hideAllTabs()
    {
        for(let tab of this.nodeContent.children)
            tab.classList.add("hidden");

        for(let tab of this.nodeTabs.children)
            tab.classList.remove("active");
    }

    showTab(tabId)
    {
        let tab = this.getTab(tabId);
        if(tab){
            tab.classList.remove("hidden");
        }
    }

    createTab(type, tabId, file, data)
    {
        let editorType = BFRES_FileTypes.info[type].editor;

        let scriptPath = "./editors/" + editorType + "/app.js";
        let htmlPath   = "./lib/editors/" + editorType + "/app.html";

        // add content html
        let htmlData = new HTML_Loader(htmlPath);
        let htmlNode = htmlData.create();
        htmlNode.children[0].id = "tab_content_" + tabId;
        this.nodeContent.append(htmlNode);

        // load script
        let app = null;
        try{
            let App_Class = require(scriptPath);
            app = new App_Class(document.getElementById("tab_content_" + tabId), file, data);
        } catch(e){
            console.log("Tab_Manager::add script for type '%s' not found!", editorType);
            console.log(e.stack);
            return false;
        }

        return true;
    }

    open(listNode, type, id, file, data)
    {
        let tabId = type + "_" + id;

        if(this.getTab(tabId) == null)
        {
            this.createTab(type, tabId, file, data);
        }

        this.hideAllTabs();

        listNode.classList.add("loaded");
        listNode.classList.add("active");

        this.showTab(tabId);
    }
};
