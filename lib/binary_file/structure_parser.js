/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/
const Binary_File = require('./file_handler.js');

module.exports = class Binary_File_Parser
{
    constructor(filePath)
    {
        this.file = new Binary_File(filePath);
    }

    pos(newPos = -1)
    {
        return this.file.pos(newPos);
    }

    _resolveParam(data, offset, value)
    {
        if(typeof(value) == "string")
            return (value == "@offset") ? offset : parseInt(data[value]);

        return parseInt(value);
    }

    _readSingleValue(data, info, offset = -1)
    {
        let realOffset = this.pos();

        if(offset != -1 && info.addOffset)
        {
            offset += parseInt(info.addOffset);
            realOffset = offset;
        }

        let currentOffset = offset < 0 ? realOffset : offset;

        switch(info.type)
        {
            case "bom":
                let bom =  [this.file.read("u8"), this.file.read("u8")];
                this.file.setEndian((bom[0] == 0xFE) ? "big" : "little");
                return bom;

            case "string":
                let length = this._resolveParam(data, currentOffset, this._resolveParam(data, currentOffset, info.length));
                return this.file.readString(length, offset);

            case "structure":

                if(typeof(info.structure) == "string")
                    info.structure = require.main.require(info.structure);

                return this.parse(info.structure);

            case "buffer":
                return this.file.buffer.slice(currentOffset, currentOffset + this._resolveParam(data, currentOffset, info.length));
            break;

            default:
                let value = this.file.read(info.type, offset);

                if(value === null)
                {
                    console.error("Binary_File_Parser OOB: pos: " + realOffset + " @offset " + offset);
                    console.log(info);
                    console.log(data);
                }

                if(info.addValue != null && (info.addValue != "@offset" || value != 0)) {
                    value += this._resolveParam(data, currentOffset, info.addValue);
                }

                return value;
        }
    }

    parse(fileStruct)
    {
        let data = {};

        for(let name in fileStruct)
        {
            let info = fileStruct[name];
            let offset = -1;
            let currentOffset = this.pos();

            let restoreOffset = typeof(info.restoreOffset) != "boolean" ? false : info.restoreOffset;

            if(info.setOffset != null)
                this.pos(this._resolveParam(data, currentOffset, info.setOffset));

            if(info.offset != null)
                offset = this._resolveParam(data, currentOffset, info.offset);

            if(info.value != null)
            {
                data[name] = this._resolveParam(data, currentOffset, info.value);
            }else{
                if(info.count == null){
                    data[name] = this._readSingleValue(data, info, offset);
                }else{
                    let count = this._resolveParam(data, currentOffset, info.count);

                    data[name] = new Array(count);
                    for(let i=0; i<count; ++i){
                        data[name][i] = this._readSingleValue(data, info, offset);
                    }
                }
            }

            if (info.checkValue != null && info.checkValue != data[name]) {
                let errorMessage = `Binary_File_Parser: invalid value!\nExpected: '${info.checkValue}', got: '${data[name]}'`;
                console.warn(errorMessage);
                throw errorMessage;
            }

            if(restoreOffset)
                this.pos(currentOffset);
        }

        return data;
    }
};
