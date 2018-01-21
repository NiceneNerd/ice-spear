/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Binary_File_Parser = require.main.require('./lib/binary_file/structure_parser.js');
const BFRES_FileTypes    = require.main.require('./bfres/file_types.js');
const Content_Types      = require.main.require("./bfres/content_types.json");

module.exports = class FSHU_Parser
{
    constructor(parser, entry, contentType)
    {
        this.entry  = entry;
        this.parser = parser;
        this.header = null;
        this.contentType = contentType;
    }
    parse()
    {
        try{
            this.parser.pos(this.entry.dataPointer);
            this.header = this.parser.parse(require("./header.json"));

            console.log(this.header);

        } catch (err) {
            console.warn(`FSHU::parse Exception: ${err}`);
            return false;
        }

        return true;
    }
};
