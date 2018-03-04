/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const electron = require('electron');
const fs       = require('fs');
const path     = require('path');
const url      = require('url');
const Split    = require('split.js');
const Filter   = requireGlobal("lib/filter.js");

const {dialog} = electron.remote;
const BrowserWindow = electron.remote.BrowserWindow;

const App_Base = requireGlobal("./apps/base.js");
const File_Drop = requireGlobal("./lib/file_drop.js");

module.exports = class App extends App_Base
{
    constructor(window, args)
    {
        super(window, args);

        this.tabNodeTabs    = this.node.querySelector("#main-sidebar-left");
        this.tabNodeContent = this.node.querySelector("#main-sidebar-right");
        this.valueNodes = [];

        this.fileFilter = new Filter(this.tabNodeTabs.querySelector(".list-group-header input"), this.tabNodeTabs, ".list-group-item");

        let tabs = this.tabNodeTabs.querySelectorAll(".list-group-item");
        for(let tab of tabs)
        {
            tab.onclick = () => {
                
                for(let otherTab of tabs)
                    otherTab.classList.remove("active");

                tab.classList.add("active");

                let tabName = tab.getAttribute("data-tab");
                for(let tabContent of this.tabNodeContent.children)
                {
                    tabContent.hidden = tabContent.getAttribute("data-tab") != tabName;
                }
            };
        }

        this.initDragDrop();
        this.initValues();
    }

    initDragDrop()
    {
        let dragNodes = this.node.querySelectorAll(".drag-drop-dir");
        for(let dragNode of dragNodes)
            File_Drop.create(dragNode, () => this.save());
    }

    initValues()
    {
        this.valueNodes = this.node.querySelectorAll("input[data-configRef]");
        for(let node of this.valueNodes)
        {
            node.value = this.config.getValue(node.getAttribute("data-configRef"));
        }
    }

    save()
    {
        for(let node of this.valueNodes)
        {
            let configRef = node.getAttribute("data-configRef");
            this.config.setValue(configRef, node.value);
        }
        this.config.save();
    }

    async run()
    {
    }
};
