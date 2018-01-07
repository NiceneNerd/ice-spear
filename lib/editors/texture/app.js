//const Binary_File_Parser = require.main.require('./lib/binary_file/structure_parser.js');
const BFRES_FileTypes = require.main.require("./bfres/file_types.js");

module.exports = class Editor_Texture
{
    constructor(node, parser, entry)
    {
        this.info = {
            name: "Texture-Editor"
        };

        this.node   = node;
        this.entry  = entry;
        this.parser = parser;
        this.file   = this.parser.file;

        this.loadData();
    }

    loadData()
    {
        this.renderData();
    }

    renderData(fileOffset)
    {

    }
};
