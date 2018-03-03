/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Binary_File_Loader = requireGlobal('./lib/binary_file/file_loader.js');
const Tab_Manager        = requireGlobal('./lib/tab_manager.js');
const Theme_Manager      = requireGlobal('./lib/theme_manager.js');
const SARC               = requireGlobal("lib/sarc/sarc.js");
const String_Table       = requireGlobal("lib/string_table/string_table.js");

const electron = require('electron');
const fs       = require('fs');
const path     = require('path');
const url      = require('url');
const Split    = require('split.js');
const Filter   = requireGlobal("lib/filter.js");

const {dialog} = electron.remote;
const BrowserWindow = electron.remote.BrowserWindow;

const App_Base = requireGlobal("./apps/base.js");

module.exports = class App extends App_Base
{
    constructor(window, args)
    {
        super(window, args);
        var that = this;

        this.stringTable = new String_Table();

        this.footerNode = footer.querySelector(".data-footer");
/*
        Split(['#main-sidebar-left', '#main-sidebar-right'], {
            sizes     : [50, 50],
            minSize   : 0,
            snapOffset: 60,
            gutterSize: 12
        });
*/
        let appButtons = this.node.querySelectorAll(".button-open-app");
        for(let btn of appButtons)
        {
            btn.onclick = () => 
            {
                let appName = btn.getAttribute("data-appName");
                if(appName != null)
                {
                    this.windowHandler.open(appName);
                }
            };
        }

        this.selectShrine = this.node.querySelector("select.shrineList");
        this.selectModel  = this.node.querySelector("select.modelList");

        this.selectShrine.ondblclick = function(a,b) 
        {
            if(this.value != null)
                that.windowHandler.open("shrine_editor", {file: this.value});
        };

        this.selectModel.ondblclick = function(a,b) 
        {
            if(this.value != null)
                that.windowHandler.open("bfres_editor", {file: this.value});
        };

        this.shrineFilter = new Filter(this.node.querySelector(".shrine input"), this.selectShrine, "option", null);
        this.modelFilter  = new Filter(this.node.querySelector(".model  input"), this.selectModel,  "option", null);

        this.clear();
    }

    clear()
    {
    }

    extractSARC(filePath = null, outputPath = null)
    {
        let path = dialog.showOpenDialog({properties: ['openFile']});
        if(path == null)return false;
        filePath = path[0];

        path = dialog.showOpenDialog({properties: ['openDirectory']});
        if(path == null)return false;
        outputPath = path[0];

        let fileName = filePath.split(/[\\/]+/).pop();

        let sarc = new SARC(this.stringTable);
        let files = sarc.parse(filePath);

        sarc.extractFiles(outputPath, fileName + ".unpacked", true);

        return true;
    }

    async scanShrineDir()
    {
        const shrineRegex = /^Dungeon[0-9]{3}\.pack$/;
        let shrineDir = this.config.getValue("game.path") + "/content/Pack";
        
        let files = fs.readdir(shrineDir, (err, files) => {
            let shrinesHtml = "";

            files.forEach(file => {
                if(shrineRegex.test(file)){
                    shrinesHtml += `<option value="${shrineDir + "/" + file}">${file}</option>`;
                }
            });
            this.selectShrine.innerHTML = shrinesHtml;
        });
    }

    async scanModelTextureDir()
    {
        let modelDir = this.config.getValue("game.path") + "/content/Model";

        let files = fs.readdir(modelDir, (err, files) => {
            let modelsHtml = "";
            let texHtml = "";
            files.forEach(file => {
                if(!file.includes(".Tex1") && !file.includes(".Tex2"))
                    modelsHtml += `<option value="${modelDir + "/" + file}">${file}</option>`;
            });
            this.selectModel.innerHTML = modelsHtml;
        });
    }

    async run()
    {
        this.scanShrineDir();
        this.scanModelTextureDir();
    }

};



  /*
        let Aimara = requireGlobal("lib/external/aimara/aimara.js");
        let tree = Aimara("main-tree-files", null, "assets/img/treeview/");

        var node1 = tree.createNode('Node A',false);
        node1.createChildNode('Node A-1', false);
        node1.createChildNode('Node A-2', false).createChildNode('Node A-2-1', false);

        tree.drawTree();

        node1 = tree.createNode('Node-B',false);
        node1.createChildNode('Node-B-1', false);
        */