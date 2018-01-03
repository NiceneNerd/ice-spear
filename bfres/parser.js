/**
* @author Max Bebök
*/

const Binary_File_Parser = require('./../lib/binary_file/structure_parser.js');

module.exports = class BFRES_Parser
{
    constructor()
    {
        this.bfresFile = null;

        this.header = null;
        this.files = {};
    }

    parseFileTable()
    {
        console.log(this.header);

        for(let type=0; type<this.header.fileOffsets.length; ++type)
        {
            let tablePos = this.header.fileOffsets[type];
            if(tablePos == 0 || this.header.fileCounts[type] == 0)
                continue;

            this.bfresFile.pos(tablePos);
            this.files[type] = this.bfresFile.parse(require("./index_entries.json"));
        }

        return true;
    }

    parse(filePath)
    {
        try{
            this.bfresFile = new Binary_File_Parser(filePath);

            this.header = this.bfresFile.parse(require("./header.json"));

            this.parseFileTable();

        } catch (err) {
            console.log(`BFRES::parse Exception: ${err}`);
        }
    }
};
