/**
* @author Max Bebök
*/

const Binary_File_Parser = require.main.require('./lib/binary_file/structure_parser.js');
const BFRES_FileTypes    = require.main.require('./bfres/file_types.js');
const Content_Types      = require.main.require("./bfres/content_types.json");

module.exports = class EMBEDDED_Parser
{
    constructor(parser, entry, contentType)
    {
        this.entry  = entry;
        this.parser = parser;
        this.header = null;
        this.contentType = contentType;

        this.data = null;
    }

    getTextureInfo(index)
    {
        //let totalNum = (this.data.length / 8);
        //index = (totalNum - 1 - index) * 8;
        index *= 8;

        if(index < 0 || (index + 7) >= this.data.length)
            return null;

        return this.data.slice(index, index + 8);
    }

    parse()
    {
        try{
            this.parser.pos(this.entry.dataPointer);
            this.header = this.parser.parse(require("./header.json"));

            this.data = this.parser.file.buffer.slice(this.header.offset, this.header.offset + this.header.length);
            console.log(this.data);

        } catch (err) {
            console.warn(`EMBEDED::parse Exception: ${err}`);
            return false;
        }

        return true;
    }
};