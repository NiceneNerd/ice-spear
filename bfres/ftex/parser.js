/**
* @author Max Bebök
*/

const Binary_File_Parser = require.main.require('./lib/binary_file/structure_parser.js');
const BFRES_FileTypes    = require.main.require('./bfres/file_types.js');
const FTEX_Swizzler      = require("./swizzler.js");

module.exports = class FTEX_Parser
{
    constructor(parser, entry)
    {
        this.entry  = entry;
        this.parser = parser;
        this.header = null;
    }

    u4ToU8(byte, pos)
    {
        return ((byte >> (pos * 4)) & 0xF) * 17;
    }


    parse()
    {
        try{
            this.parser.pos(this.entry.dataPointer);
            this.header = this.parser.parse(require("./header.json"));

            console.warn("== FTEX ==");
            console.log(this.header);
            console.log(this.header.surface);

            this.parser.pos(this.header.dataOffset);

            let img = this.header.surface;

            let numPixels = img.sizeX * img.sizeY * img.sizeZ;
            let bSize     = numPixels * 4;
            let _rawBuffer = this.parser.file.buffer.slice(this.header.dataOffset, this.header.dataOffset + bSize);

// S8
/*
    let rawBuffer = new Array(_rawBuffer.length);
    for(let i=0; i<_rawBuffer.length; ++i)
    {
        rawBuffer[i] = _rawBuffer.readInt8(i);
    }
*/
/*
// U16
            let rawBuffer = new Array(_rawBuffer.length * 2);
            let convertPos = 0;
            for(let val of _rawBuffer)
            {
                rawBuffer[convertPos++] = this.u4ToU8(val, 0);
                rawBuffer[convertPos++] = this.u4ToU8(val, 1);
            }

            */
            let rawBuffer = _rawBuffer;

            let swizzler = new FTEX_Swizzler();
                                   //swizzle(width, height, format_, tileMode, swizzle_, pitch, data, toGFD=False)
            //let swizzledBuffer = swizzler.swizzle(img.sizeX, img.sizeY * img.sizeZ, img.textureFormat, img.tileMode, img.swizzleValue, img.pitch, rawBuffer, false);
                                  //deswizzle(width, height, height2, format_, tileMode, swizzle_, pitch, bpp, data)
            let swizzledBuffer = swizzler.deswizzle(img.sizeX, img.sizeY, img.sizeZ, img.textureFormat, img.tileMode, img.swizzleValue, img.pitch, 128, rawBuffer);

            console.log([img.sizeX, img.sizeY, img.textureFormat, img.tileMode, img.swizzleValue, img.pitch, rawBuffer, false]);

            console.log("RESULT");
            console.log(rawBuffer);
            console.log(swizzledBuffer);

            let buffer = swizzledBuffer;


// U16
/*
            let buffer = new Uint8ClampedArray(img.sizeX * img.sizeY * 4);
            let bufferIndex = 0;

            for(let i=0; i<swizzledBuffer.length*2; i+=2)
            {
                let val = [swizzledBuffer[i], swizzledBuffer[i+1]];

                buffer[bufferIndex++] = this.u4ToU8(val[0], 0);
                buffer[bufferIndex++] = this.u4ToU8(val[0], 1);
                buffer[bufferIndex++] = this.u4ToU8(val[1], 0);
                buffer[bufferIndex++] = this.u4ToU8(val[1], 1);
                //buffer[bufferIndex++] = 255;
            }
*/
/*
            let buffer = new Uint8ClampedArray(img.sizeX * img.sizeY * 4);
            let bufferIndex = 0;
            let swizzleIndex = 0;

            for(let i=0; i<img.sizeX * img.sizeY; ++i)
            {
                buffer[bufferIndex++] = swizzledBuffer[swizzleIndex++];
                buffer[bufferIndex++] = swizzledBuffer[swizzleIndex++];
                buffer[bufferIndex++] = swizzledBuffer[swizzleIndex++];
                buffer[bufferIndex++] = swizzledBuffer[swizzleIndex++];
                //buffer[bufferIndex++] = 255;

                //swizzleIndex += img.sizeZ * 3;
            }
*/

            this.header.surface.imageBuffer = buffer;
            console.log(buffer);

        } catch (err) {
            console.warn(`FTEX::parse Exception: ${err}`);
            return false;
        }

        return true;
    }
};
