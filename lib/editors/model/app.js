const FMDL_Parser = require('./../../../bfres/fmdl/parser.js');
const Renderer    = require.main.require("./lib/threejs/renderer.js");
const Split       = require('split.js');

module.exports = class Editor_Model
{
    constructor(node, bfresParser, entry)
    {
        this.info = {
            name: "3D-Model Editor"
        };

        this.node   = node;
        this.entry  = entry;
        this.parser = bfresParser.parser;
        this.fmdlParser = null;

        this.threeJsRenderer = new Renderer(this.node.querySelector(".canvasWindow canvas"));

        Split([this.node.querySelector(".sidebar-1"), this.node.querySelector(".sidebar-2")], {
            sizes     : [50, 50],
            minSize   : 0,
            snapOffset: 60,
            gutterSize: 12
        });

        this.observerCanvas = new MutationObserver(mutations => this.threeJsRenderer.updateDrawSize());
        this.observerCanvas.observe(this.node.querySelector(".canvasWindow"), {attributes: true});

        this.observerApp = new MutationObserver(mutations => this.threeJsRenderer.updateDrawSize());
        this.observerApp.observe(this.node.parentNode, {attributes: true});

        this.loadData();
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
                <td>${mat.sectionIndex}</td>
                <td>${mat.name}</td>
                <td>${names.join("<br/>")}</td>
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
