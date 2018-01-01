const BinaryFile = require('./../../binary_file.js');
const FMDL_Parser = require('./../../../bfres/fmdl/parser.js');

module.exports = class Editor_Hex
{
    constructor(node, data)
    {
        this.info = {
            name: "3D-Model Editor"
        };

        this.node = node;
        this.entry = data;
        this.file = null;
        this.fmdlParser = null;

        this.loadData();
    }

    async loadData()
    {
        this.fmdlParser = new FMDL_Parser();
        await this.fmdlParser.parse(this.entry.parser.bfresFile.path, this.entry.dataPointer);

        this.renderData();
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
    }
};
