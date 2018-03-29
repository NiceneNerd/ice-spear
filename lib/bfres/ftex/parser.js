/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Binary_File_Parser = require('binary-file').Parser;
const BFRES_FileTypes    = requireGlobal('./lib/bfres/file_types.js');
const FTEX_Swizzler      = requireGlobal('./lib/bfres/ftex/swizzler.js');
const GX2_Block_Handler  = requireGlobal('./lib/bfres/gx2/block_handler.js');
const Content_Types      = requireGlobal("lib/bfres/content_types.json");

module.exports = class FTEX_Parser
{
    constructor(parser, entry, contentType)
    {
        this.entry  = entry;
        this.parser = parser;
        this.header = null;
        this.contentType = contentType;

        this.pow2 = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768];
        this.pow2Rev = [32768, 16384, 8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1];

        this.mipmapStartLevel = (this.contentType == Content_Types.MIPMAP) ? 1 : 0;

        this.textureTypes = requireGlobal("lib/bfres/gx2/texture_types.json");
        this.loader = null;
    }

    isPow2(val)
    {
        for(let p of this.pow2)
        {
            if(p == val)return true;
        }
        return false;
    }

    getNextPow2(val)
    {
        for(let p of this.pow2Rev)
        {
            if(p <= val)
                return p;
        }
        return 0;
    }

    adjustToBlockSize(val, blockSize)
    {
        return Math.ceil(val / blockSize) * blockSize;
    }

    async parse()
    {
        console.log("=========== TEX ===========");

        if(this.loader)await this.loader.setStatus("Loading FTEX Texture");

        try{
            console.time("overall");

            console.time("structure-parser");

            this.parser.pos(this.entry.dataPointer);
            this.header = this.parser.parse(require("./header.json"));
            this.entry.fileName = this.header.fileName;

            if(this.loader)await this.loader.setInfo(this.entry.fileName);

            console.timeEnd("structure-parser");

            let img = this.header.surface;
            let texTypeInfo = this.textureTypes[img.textureFormat];

            if(this.mipmapStartLevel > 0)
            {
                let mipmapMulti = Math.pow(2, this.mipmapStartLevel);
                let mipmapDiff = img.mipmapCount;

                let mipmapPitchMulti = this.isPow2(img.pitch) ? mipmapMulti : (mipmapMulti-1);
                img.pitch = this.getNextPow2(Math.floor(img.pitch / mipmapPitchMulti)); // mm: 10

                let blockSize = GX2_Block_Handler.getBlockSize(img.textureFormat);

                img.sizeX = this.adjustToBlockSize(img.sizeX >> this.mipmapStartLevel, blockSize.x);
                img.sizeY = this.adjustToBlockSize(img.sizeY >> this.mipmapStartLevel, blockSize.y);

                // here are some weird mipmap rules i found out
                // there must be a definition for this somewhere but i can't find it
                // @TODO investigate more

                if(img.swizzleValue < 0x20000) // got that number from testing a lot of textures
                    img.tileMode = 2;
            }

            let rawBuffer = this.parser.file.buffer.slice(this.header.dataOffset, this.header.dataOffset + this.header.surface.dataSize);

            console.log(this.header.fileName);
            console.time("swizzle");

            let swizzler = new FTEX_Swizzler();
            let deSwizzledBuffer = swizzler.deswizzle(img.sizeX, img.sizeY, img.sizeZ, img.textureFormat, img.tileMode, img.swizzleValue, img.pitch, texTypeInfo.bpBlock, rawBuffer);
            //let deSwizzledBuffer = rawBuffer;

            console.timeEnd("swizzle");
            console.time("GXn");

            let blockHandler = new GX2_Block_Handler(deSwizzledBuffer, [img.sizeX, img.sizeY, img.sizeZ], img.textureFormat);
            let colorBuffer = blockHandler.decode();

            console.timeEnd("GXn");

            this.header.surface.imageBuffer = colorBuffer;

            console.timeEnd("overall");
        } catch (err) {
            console.warn(`FTEX::parse Exception: ${err}`);
            return false;
        }

        return true;
    }
};
