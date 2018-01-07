/**
* @author Max Bebök
*/

const Binary_File_Parser = require.main.require('./lib/binary_file/structure_parser.js');
const BFRES_FileTypes    = require.main.require('./bfres/file_types.js');

module.exports = class BFRES_Parser
{
    constructor()
    {
        this.parser = null;
        this.header = null;
        this.files  = {};
    }

    parseFileTable()
    {
        for(let type=0; type<this.header.fileOffsets.length; ++type)
        {
            let tablePos = this.header.fileOffsets[type];
            if(tablePos == 0 || this.header.fileCounts[type] == 0)
                continue;

            this.parser.pos(tablePos);
            this.files[type] = this.parser.parse(require("./index_entries.json"));

            let test = 0;
            for(let entry of this.files[type].entries)
            {
                let fileInfo = BFRES_FileTypes.info[type];
                entry.type = type;

                if(fileInfo.preload === true && entry.namePointer != 0)
                {
                    const Parser_Class = require.main.require(fileInfo.parser);
                    let parser = new Parser_Class(this, entry);
                    parser.parse();

                    if(++test > 2)return;
                }
            }
        }

        return true;
    }

    parse(filePath)
    {
        try{
            this.parser = new Binary_File_Parser(filePath);
            this.header = this.parser.parse(require("./header.json"));

            this.parseFileTable();

        } catch (err) {
            console.warn(`BFRES::parse Exception: ${err}`);
            return false;
        }

        return true;
    }
};
