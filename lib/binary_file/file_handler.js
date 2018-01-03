/**
* @author Max Bebök
*/

const fs = require('fs');

module.exports = class Binary_File
{
    constructor(filePath)
    {
        // constants
        this.ENDIAN_LITTLE = 0;
        this.ENDIAN_BIG    = 1;

        // file settings
        this.filePath = filePath;
        this.buffer   = fs.readFileSync(filePath);
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
                read : [this.buffer.readUInt32LE, this.buffer.readUInt32LE],
                write: [],
                size : 4
            },
            s32  : {
                read : [this.buffer.readInt32LE, this.buffer.readInt32BE],
                write: [],
                size : 4
            },
            float  : {
                read : [this.buffer.readFloatLE, this.buffer.readFloatBE],
                write: [],
                size : 4
            },
            double  : {
                read : [this.buffer.readDoubleLE, this.buffer.readDoubleBE],
                write: [],
                size : 8
            }
        };
        this.types["char"] = this.types.u8;
    }

    setEndian(endian)
    {
        if(endian == "big")
            this.endian = this.ENDIAN_BIG;
        else if(endian == "little")
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

        let typeObj = this.types[type];
        if(typeObj == null)
            return null;

        let val = typeObj.read[this.endian].call(this.buffer, pos);

        if(offset < 0)
            this.offset += typeObj.size;

        return val;
    }

    readString(size, offset = -1)
    {
        let pos = offset < 0 ? this.offset : offset;

        let res = this.buffer.toString("utf8", pos, pos + size);

        if(offset < 0)
            this.offset += size;

        return res;
    }

};
