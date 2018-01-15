const FMDL_Parser = require('./../../../bfres/fmdl/parser.js');
const Renderer    = require.main.require("./lib/threejs/renderer.js");

module.exports = class Editor_Hex
{
    constructor(node, parser, entry)
    {
        this.info = {
            name: "3D-Model Editor"
        };

        this.node   = node;
        this.entry  = entry;
        this.parser = parser;
        this.fmdlParser = null;

        this.threeJsRenderer = new Renderer(this.node.querySelector(".canvasWindow canvas"));

        this.loadData();
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

            fmatNameHtml += `<tr>
                <td>${mat.name}</td>
                <td>${names.join("<br/>")}</td>
            </tr>`;
        }
        fmatNameTbody.innerHTML = fmatNameHtml;

    }
};
