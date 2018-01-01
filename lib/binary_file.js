/**
* @author Max Bebök
*/

const Binary_File_Base = require('binary-file');

class Binary_File extends Binary_File_Base
{
    async readInt8Array (num, position) {
        let res = [];
        for(let i=0; i<num; ++i)res.push(await this.readInt8(position));
        return res;
    }

    async readUInt8Array (num, position) {
        let res = [];
        for(let i=0; i<num; ++i)res.push(await this.readUInt8(position));
        return res;
    }

    async readInt16Array (num, position) {
        let res = [];
        for(let i=0; i<num; ++i)res.push(await this.readInt16(position));
        return res;
    }

    async readUInt16Array (num, position) {
        let res = [];
        for(let i=0; i<num; ++i)res.push(await this.readUInt16(position));
        return res;
    }

    async readInt32Array (num, position) {
        let res = [];
        for(let i=0; i<num; ++i)res.push(await this.readInt32(position));
        return res;
    }

    async readUInt32Array (num, position) {
        let res = [];
        for(let i=0; i<num; ++i)res.push(await this.readUInt32(position));
        return res;
    }

    async readFloatArray (num, position) {
        let res = [];
        for(let i=0; i<num; ++i)res.push(await this.readFloat(position));
        return res;
    }

    async readDoubleArray (num, position) {
        let res = [];
        for(let i=0; i<num; ++i)res.push(await this.readDouble(position));
        return res;
    }

};

module.exports = Binary_File;
