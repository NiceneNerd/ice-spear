/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs');

module.exports = class Binary_File
{
    constructor(filePathOrBuffer)
    {
        let isBuffer = (filePathOrBuffer instanceof Buffer);

        // constants
        this.ENDIAN_LITTLE = 0;
        this.ENDIAN_BIG    = 1;

        // file settings
        this.filePath = isBuffer ? null : filePathOrBuffer;
        this.buffer   = isBuffer ? filePathOrBuffer : fs.readFileSync(filePathOrBuffer);
        this.offset   = 0;
        this.endian   = this.ENDIAN_LITTLE;

        // data types
        this.types = {
            u8  : {
                read : [this.buffer.readUInt8, this.buffer.readUInt8],
                write: [],
                size : 1
            },
            s8  : {
                read : [this.buffer.readInt8, this.buffer.readInt8],
                write: [],
                size : 1
            },
            u16  : {
                read : [this.buffer.readUInt16LE, this.buffer.readUInt16BE],
                write: [],
                size : 2
            },
            s16  : {
                read : [this.buffer.readInt16LE, this.buffer.readInt16BE],
                write: [],
                size : 2
            },
            u32  : {
                read : [this.buffer.readUInt32LE, this.buffer.readUInt32BE],
                write: [],
                size : 4
            },
            s32  : {
                read : [this.buffer.readInt32LE, this.buffer.readInt32BE],
                write: [],
                size : 4
            },
            float16  : {
                read : [
                    offset => this.decodeFloat16(this.buffer.readUInt16LE(offset)),
                    offset => this.decodeFloat16(this.buffer.readUInt16BE(offset))
                ],
                write: [],
                size : 2
            },
            float32  : {
                read : [this.buffer.readFloatLE, this.buffer.readFloatBE],
                write: [],
                size : 4
            },
            float64  : {
                read : [this.buffer.readDoubleLE, this.buffer.readDoubleBE],
                write: [],
                size : 8
            }
        };

        this.types["char"] = this.types.u8;
        this.types["float"] = this.types.float32;
        this.types["double"] = this.types.float64;
    }

    /**
     * Taken from on:
     * @author https://stackoverflow.com/a/5684578
     */
    decodeFloat16(binary)
    {
        let exponent = (binary & 0x7C00) >> 10;
        let fraction = binary & 0x03FF;

        return (binary >> 15 ? -1 : 1) * (
            exponent ?
            (
                exponent === 0x1F ?
                fraction ? NaN : Infinity :
                Math.pow(2, exponent - 15) * (1 + fraction / 0x400)
            ) :
            6.103515625e-5 * (fraction / 0x400)
        );
    }

    setEndian(endian)
    {
        if(endian == "big" || endian == this.ENDIAN_BIG)
            this.endian = this.ENDIAN_BIG;
        else if(endian == "little" || endian == this.ENDIAN_LITTLE)
            this.endian = this.ENDIAN_LITTLE;
    }

    pos(newPos = -1)
    {
        if(newPos >= 0)
            this.offset = newPos;

        return this.offset;
    }

    read(type, offset = -1)
    {
        let pos = offset < 0 ? this.offset : offset;

        if(pos >= this.buffer.length) {
            console.log("PEOF: " + pos);
            return null;
        }

        let typeObj = this.types[type];
        if(typeObj == null)
            return null;

        let val = typeObj.read[this.endian].call(this.buffer, pos);

        if(offset < 0)
            this.offset += typeObj.size;

        return val;
    }

    readString(size = -1, offset = -1)
    {
        let pos = offset < 0 ? this.offset : offset;
        let zeroEnding = false;

        if(size < 0)
        {
            let strBuff = this.buffer.slice(pos);
            size = strBuff.findIndex(val => val==0);
            zeroEnding = true;
        }

        let res = this.buffer.toString("utf8", pos, pos + size);

        if(offset < 0)
            this.offset += size + (zeroEnding ? 1 : 0);

        return res;
    }

};
