/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs');

module.exports = class Binary_File
{
    constructor(filePathOrBuffer = null)
    {
        let isBuffer = filePathOrBuffer == null || (filePathOrBuffer instanceof Buffer);

        // constants
        this.ENDIAN_LITTLE = 0;
        this.ENDIAN_BIG    = 1;
        this.BUFFER_DEF_SIZE = (1024 * 1024) * 10; // 10MB

        // file settings
        this.filePath = isBuffer ? null : filePathOrBuffer;

        if(filePathOrBuffer == null)
        {
            this.buffer = Buffer.alloc(this.BUFFER_DEF_SIZE);
            this.maxOffset = 0;
        }else{
            this.buffer = isBuffer ? filePathOrBuffer : fs.readFileSync(filePathOrBuffer);
            this.maxOffset = this.buffer.length;
        }

        this.offset = 0;
        this.endian = this.ENDIAN_LITTLE;

        this.offsetStack = [];

        // data types
        this.types = {
            u8  : {
                read : [this.buffer.readUInt8, this.buffer.readUInt8],
                write: [this.buffer.writeUInt8, this.buffer.writeUInt8],
                size : 1
            },
            s8  : {
                read : [this.buffer.readInt8, this.buffer.readInt8],
                write: [this.buffer.writeInt8, this.buffer.writeInt8],
                size : 1
            },
            u16  : {
                read : [this.buffer.readUInt16LE, this.buffer.readUInt16BE],
                write: [this.buffer.writeUInt16LE, this.buffer.writeUInt16BE],
                size : 2
            },
            s16  : {
                read : [this.buffer.readInt16LE, this.buffer.readInt16BE],
                write: [this.buffer.writeInt16LE, this.buffer.writeInt16BE],
                size : 2
            },
            u24  : {
                read : [
                    offset => {return (this.buffer.readUInt8(offset)   << 16) | this.buffer.readUInt16LE(offset+1)},
                    offset => {return (this.buffer.readUInt16BE(offset) << 8) | this.buffer.readUInt8(offset+2)   },
                ],
                write: [],
                size : 3
            },
            u32  : {
                read : [this.buffer.readUInt32LE, this.buffer.readUInt32BE],
                write: [this.buffer.writeUInt32LE, this.buffer.writeUInt32BE],
                size : 4
            },
            s32  : {
                read : [this.buffer.readInt32LE, this.buffer.readInt32BE],
                write: [this.buffer.writeInt32LE, this.buffer.writeInt32BE],
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
                write: [this.buffer.writeFloatLE, this.buffer.writeFloatBE],
                size : 4
            },
            float64  : {
                read : [this.buffer.readDoubleLE, this.buffer.readDoubleBE],
                write: [this.buffer.writeDoubleLE, this.buffer.writeDoubleBE],
                size : 8
            },

            bool32 : {
                read : [
                    offset => this.buffer.readUInt32LE(offset) != 0,
                    offset => this.buffer.readUInt32BE(offset) != 0
                ],
                write: [
                    (value, offset) => this.buffer.writeUInt32LE(value == 0 ? 0 : 1, offset),
                    (value, offset) => this.buffer.writeUInt32BE(value == 0 ? 0 : 1, offset)
                ],
                size : 4
            },
            bool16 : {
                read : [
                    offset => this.buffer.readUInt16LE(offset) != 0,
                    offset => this.buffer.readUInt16BE(offset) != 0
                ],
                write: [
                    (value, offset) => this.buffer.writeUInt16LE(value == 0 ? 0 : 1, offset),
                    (value, offset) => this.buffer.writeUInt16BE(value == 0 ? 0 : 1, offset)
                ],
                size : 2
            },
            bool8 : {
                read : [
                    offset => this.buffer.readUInt8(offset) != 0,
                    offset => this.buffer.readUInt8(offset) != 0
                ],
                write: [
                    (value, offset) => this.buffer.writeUInt8(value == 0 ? 0 : 1, offset),
                    (value, offset) => this.buffer.writeUInt8(value == 0 ? 0 : 1, offset)
                ],
                size : 1
            },
        };

        this.types["char"]   = this.types.u8;
        this.types["float"]  = this.types.float32;
        this.types["double"] = this.types.float64;
        this.types["bool"]   = this.types.bool32;
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

    getBuffer(start = 0)
    {
        return this.buffer.slice(start, this.maxOffset);
    }

    posPush()
    {
        this.offsetStack.push(this.pos());
    }

    posPop()
    {
        let offset = this.offsetStack.pop();
        if(offset != null)
            this.pos(offset);
    }

    alignTo(bytes)
    {
        this.pos(Math.ceil(this.pos() / bytes) * bytes);
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

    write(type, value, offset = -1)
    {
        let pos = offset < 0 ? this.offset : offset;

        if(pos >= this.buffer.length) {
            console.log("PEOF: " + pos);
            console.warn("@TODO: reallocate new buffer");
            return 0;
        }

        let typeObj = this.types[type];
        if(typeObj == null)
            return null;

        let bytesWritten = typeObj.write[this.endian].call(this.buffer, value, pos);

        if(offset < 0)
            this.offset += typeObj.size;

        if(this.offset > this.maxOffset)
            this.maxOffset = this.offset;

        return bytesWritten;
    }

};