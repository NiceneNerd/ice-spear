/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const electron = require('electron');
const {dialog} = electron.remote;

const Split       = require('split.js');
const FMDL_Parser = require.main.require('./bfres/fmdl/parser.js');
const Renderer    = require.main.require("./lib/threejs/renderer.js");
const Filter      = require.main.require("./lib/filter.js");
const Converter_OBJ = require.main.require("./lib/model_converter/obj.js");

module.exports = class Editor_Model
{
    constructor(node, bfresParser, entry)
    {
        var that = this;

        this.info = {
            name: "3D-Model Editor"
        };

        this.node       = node;
        this.entry      = entry;
        this.fmdlParser = null;

        this.bfresParser = bfresParser;
        this.parser      = bfresParser.parser;

        this.buttonExportOBJ = this.node.querySelector(".data-tool-exportOBJ");
        this.buttonExportOBJ.onclick = () => this.exportOBJ();

        this.threeJsRenderer = new Renderer(this.node.querySelector(".canvasWindow canvas"));

        Split([this.node.querySelector(".sidebar-1"), this.node.querySelector(".sidebar-2"), this.node.querySelector(".sidebar-3")], {
            sizes     : [20, 70, 10],
            minSize   : 0,
            snapOffset: 60,
            gutterSize: 12
        });

        this.observerCanvas = new MutationObserver(mutations => this.threeJsRenderer.updateDrawSize());
        this.observerCanvas.observe(document.querySelector("#main-sidebar-right"), {attributes: true});

        this.observerApp = new MutationObserver(mutations => this.threeJsRenderer.updateDrawSize());
        this.observerApp.observe(this.node.querySelector(".sidebar-2"), {attributes: true});

        this.filterMaterial = new Filter(this.node.querySelector("input.search-material"), this.node.querySelector(".data-fmat-names"));

        this.loadData();
    }

    exportOBJ()
    {
        let path = dialog.showOpenDialog({properties: ['openDirectory']});
        let name   = this.bfresParser.header.fileName;
        let models = this.fmdlParser.models;

        if(Object.keys(models).length > 0)
        {
            let converter = new Converter_OBJ();
            converter.convert(models, path, name);
        }
    }

    clear()
    {
        if(this.observerCanvas)
        {
            this.observerCanvas.disconnect();
            this.observerCanvas = null;
        }

        if(this.observerApp)
        {
            this.observerApp.disconnect();
            this.observerApp = null;
        }
    }

    loadData()
    {
        this.parser.pos(this.entry.dataPointer);
        this.fmdlParser = new FMDL_Parser(this.parser);

        if(this.fmdlParser.parse())
        {
            this.renderData();
        }
    }

// @TODO start always aligned to 0x16!
//
    renderData()
    {
        var that = this;

        this.node.querySelector(".data-header-fileName").innerHTML = this.fmdlParser.header.fileName;
        this.node.querySelector(".data-header-filePath").innerHTML = this.fmdlParser.header.filePath;

        this.node.querySelector(".data-header-fvtxCount").innerHTML = this.fmdlParser.header.fvtxCount;
        this.node.querySelector(".data-header-fshpCount").innerHTML = this.fmdlParser.header.fshpCount;
        this.node.querySelector(".data-header-fmatCount").innerHTML = this.fmdlParser.header.fmatCount;
        this.node.querySelector(".data-header-userDataCount").innerHTML = this.fmdlParser.header.userDataCount;

        this.threeJsRenderer.start();

        for(let i in this.fmdlParser.models)
            this.threeJsRenderer.addModel(this.fmdlParser.models[i]);

        let fmatNameTbody = this.node.querySelector(".data-fmat-names");
        let fmatNameHtml = "";
        for(let mat of this.fmdlParser.materials)
        {
            let names = [];
            for(let texRef of mat.textureRef)
            {
                 names.push(texRef.name + (texRef.headerOffset == 0 ? " (*)" : ""));
             }

            fmatNameHtml += `<tr data-modelName="${mat.name}" data-active="1" class="active">
                <td class="search-value">${mat.sectionIndex}</td>
                <td class="search-value">${mat.name}</td>
                <td class="search-value">${names.join("<br/>")}</td>
            </tr>`;
        }
        fmatNameTbody.innerHTML = fmatNameHtml;

        let trArray = fmatNameTbody.querySelectorAll("tr");
        for(let tr of trArray)
        {
            tr.onclick = function()
            {
                let modelName = this.getAttribute("data-modelName");
                let isActive  = this.getAttribute("data-active") != "1";

                that.threeJsRenderer.scene.getObjectByName(modelName).visible = isActive;
                this.setAttribute("data-active", isActive ? "1" : "0");

                if(isActive)
                    this.classList.add("active");
                else
                    this.classList.remove("active");
            };
        }

    }
};
