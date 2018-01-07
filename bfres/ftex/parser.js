/**
* @author Max Bebök
*/

const Binary_File_Parser = require.main.require('./lib/binary_file/structure_parser.js');
const BFRES_FileTypes    = require.main.require('./bfres/file_types.js');

module.exports = class FTEX_Parser
{
    constructor(bfresFileParser, entry)
    {
        this.entry  = entry;
        this.bfres  = bfresFileParser;
        this.parser = this.bfres.parser;
        this.header = null;
    }

    parse()
    {
        try{
            this.parser.pos(this.entry.dataPointer);
            this.header = this.parser.parse(require("./header.json"));

            console.log(this.header);
            console.log(this.header.surface);

        } catch (err) {
            console.warn(`FTEX::parse Exception: ${err}`);
            return false;
        }

        return true;
    }
};
