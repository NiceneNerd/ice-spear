/**
* @author Max Bebök
*/

const Binary_File_Parser = require.main.require('./lib/binary_file/structure_parser.js');
const BFRES_FileTypes    = require.main.require('./bfres/file_types.js');
const FTEX_Swizzler      = require.main.require('./bfres/ftex/swizzler.js');
const GX2_Block_Handler  = require.main.require('./bfres/gx2/block_handler.js');
const Content_Types      = require.main.require("./bfres/content_types.json");

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

        this.textureTypes = require.main.require("./bfres/gx2/texture_types.json");
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

    parse()
    {
        console.log("=========== TEX ===========");

        try{
            console.time("overall");

            console.time("structure-parser");

            this.parser.pos(this.entry.dataPointer);
            this.header = this.parser.parse(require("./header.json"));

            console.timeEnd("structure-parser");
            console.log(this.header);
            //if(this.header.fileName != "CmnTex_Etc_BoxPartsTextDungeon_A_Alb")return false; // #22
            let img = this.header.surface;
            let texTypeInfo = this.textureTypes[img.textureFormat];

            if(this.mipmapStartLevel > 0)
            {
                let mipmapMulti = Math.pow(2, this.mipmapStartLevel);
                let mipmapDiff = img.mipmapCount;

                let mipmapPitchMulti = this.isPow2(img.pitch) ? mipmapMulti : (mipmapMulti-1);
                img.pitch = this.getNextPow2(Math.floor(img.pitch / mipmapPitchMulti)); // mm: 10

/*
                img.sizeX = this.getNextPow2(Math.floor(img.sizeX / mipmapMulti));
                img.sizeY = this.getNextPow2(Math.floor(img.sizeY / mipmapMulti));
*/

                img.sizeX >>= this.mipmapStartLevel;
                img.sizeY >>= this.mipmapStartLevel;

                if(img.sizeY * img.sizeX <= 4096)
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
