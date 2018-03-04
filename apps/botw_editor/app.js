/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const SARC = requireGlobal("lib/sarc/sarc.js");

const electron = require('electron');
const fs       = require('fs');
const path     = require('path');
const url      = require('url');
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
        
        let files = fs.readdir(shrineDir, (err, files) => 
        {
            if(files == null)return;
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

        let files = fs.readdir(modelDir, (err, files) => 
        {
            if(files == null)return;

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
