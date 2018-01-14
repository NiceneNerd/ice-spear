/**
* @author Max Bebök
*/

const Binary_File_Parser = require.main.require('./lib/binary_file/structure_parser.js');
const BFRES_FileTypes    = require.main.require('./bfres/file_types.js');
const FTEX_Swizzler      = require.main.require('./bfres/ftex/swizzler.js');
const GX2_Block_Handler  = require.main.require('./bfres/gx2/block_handler.js');

module.exports = class FTEX_Parser
{
    constructor(parser, entry)
    {
        this.entry  = entry;
        this.parser = parser;
        this.header = null;

        this.textureTypes = require.main.require("./bfres/gx2/texture_types.json");
    }

    parse()
    {
        try{
            this.parser.pos(this.entry.dataPointer);
            this.header = this.parser.parse(require("./header.json"));

            let img = this.header.surface;
            let rawBuffer = this.parser.file.buffer.slice(this.header.dataOffset, this.header.dataOffset + this.header.surface.dataSize);

            let texTypeInfo = this.textureTypes[img.textureFormat];

            let swizzler = new FTEX_Swizzler();
            let deSwizzledBuffer = swizzler.deswizzle(img.sizeX, img.sizeY, img.sizeZ, img.textureFormat, img.tileMode, img.swizzleValue, img.pitch, texTypeInfo.bpBlock, rawBuffer);

            let blockHandler = new GX2_Block_Handler(deSwizzledBuffer, [img.sizeX, img.sizeY, img.sizeZ], img.textureFormat);
            let colorBuffer = blockHandler.decode();

            this.header.surface.imageBuffer = colorBuffer;

        } catch (err) {
            console.warn(`FTEX::parse Exception: ${err}`);
            return false;
        }

        return true;
    }
};
