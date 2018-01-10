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
        //try{
            this.parser.pos(this.entry.dataPointer);
            this.header = this.parser.parse(require("./header.json"));

            console.warn("== FTEX ==");
            console.log(this.header);

            let img = this.header.surface;
            let rawBuffer = this.parser.file.buffer.slice(this.header.dataOffset, this.header.dataOffset + this.header.surface.dataSize);

            let bbp = 8 * 8; // 8 bytes * 8 bits/byte
            let swizzler = new FTEX_Swizzler();
            let swizzledBuffer = swizzler.deswizzle(img.sizeX, img.sizeY, img.sizeZ, img.textureFormat, img.tileMode, img.swizzleValue, img.pitch, bbp, rawBuffer);

            let colorBuffer = new Uint8ClampedArray(img.sizeX * img.sizeY * 4);
            let bufferIndex = 0;

            let pixelOffsetX = 0;
            let pixelOffsetY = 0;

            let blocksX = img.sizeX / 4;
            let blocksY = img.sizeY / 4;

            for(let blockY=0; blockY<blocksY; ++blockY)
            {
                for(let blockX=0; blockX<blocksX; ++blockX)
                {
                    let val = new Array(8);
                    let i = (blockY * blocksX * 8) + blockX*8;
                    val[0] = swizzledBuffer[i];
                    val[1] = swizzledBuffer[i+1];

                    if(val[0] > val[1])
                    {
                      // 6 interpolated color values
                      val[2] = (6*val[0] + 1*val[1]) / 7.0;
                      val[3] = (5*val[0] + 2*val[1]) / 7.0;
                      val[4] = (4*val[0] + 3*val[1]) / 7.0;
                      val[5] = (3*val[0] + 4*val[1]) / 7.0;
                      val[6] = (2*val[0] + 5*val[1]) / 7.0;
                      val[7] = (1*val[0] + 6*val[1]) / 7.0;
                    }
                    else
                    {
                      // 4 interpolated color values
                      val[2] = (4*val[0] + 1*val[1])/5.0;
                      val[3] = (3*val[0] + 2*val[1])/5.0;
                      val[4] = (2*val[0] + 3*val[1])/5.0;
                      val[5] = (1*val[0] + 4*val[1])/5.0;
                      val[6] = 0.0;
                      val[7] = 255.0;
                    }

                    let colorBytes = new Uint32Array([
                        (swizzledBuffer[i+4] << 16) | (swizzledBuffer[i+3] << 8) | (swizzledBuffer[i+2]),
                        (swizzledBuffer[i+7] << 16) | (swizzledBuffer[i+6] << 8) | (swizzledBuffer[i+5])
                    ]);

                    let colorValues = [];
                    for(let colByte of colorBytes)
                    {
                        for(let ct=0; ct<8; ++ct)
                        {
                            let col = (colByte >> (3 * ct)) & 0b111;
                            colorValues.push(val[col]);
                        }
                    }

                    let colorPos = 0;
                    for(let cy=0; cy<4; ++cy)
                    {
                        let yPos = (cy + pixelOffsetY) * img.sizeX * 4  + (pixelOffsetX * 4); //4=colors
                        for(let cx=0; cx<4; ++cx)
                        {
                            let xPos = yPos + (cx * 4);

                            colorBuffer[xPos++] = colorValues[colorPos];
                            colorBuffer[xPos++] = colorValues[colorPos];
                            colorBuffer[xPos++] = colorValues[colorPos++];
                            colorBuffer[xPos++] = 255;
                        }
                    }

                    pixelOffsetX += 4;
                    if(pixelOffsetX >= img.sizeX)
                    {
                        pixelOffsetX = 0;
                        pixelOffsetY += 4;
                    }

                }
            }

            this.header.surface.imageBuffer = colorBuffer;

        /*} catch (err) {
            console.warn(`FTEX::parse Exception: ${err}`);
            return false;
        }*/

        return true;
    }
};
