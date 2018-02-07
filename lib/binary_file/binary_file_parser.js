/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/
const Binary_File = require('./binary_file.js');

module.exports = class Binary_File_Parser
{
    constructor(filePath)
    {
        this.file = new Binary_File(filePath);
        this.functions = {};
    }

    pos(newPos = -1)
    {
        return this.file.pos(newPos);
    }

    _resolveParam(data, offset, value)
    {
        if(value === null)
            return 0;

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
        let result = null;
        let dataType = info.type;

        if(info.function != null)
        {
            let fc = this.functions[info.function];
            if(fc == null)
                throw `Binary_File_Parser: unknown custom function: '${info.function}'`;

            result = fc(this.file, info);
            dataType = "ignore";
        }
        
        switch(dataType)
        {
            case "bom":
                result = [this.file.read("u8"), this.file.read("u8")];
                this.file.setEndian((result[0] == 0xFE) ? "big" : "little");
            break;

            case "string":
                let length = this._resolveParam(data, currentOffset, info.length == null ? -1 : info.length);
                result = this.file.readString(length, offset);
            break;

            case "structure":

                if(typeof(info.structure) == "string")
                    info.structure = requireGlobal(info.structure);

                result = this.parse(info.structure);
            break;

            case "buffer":
                result = this.file.buffer.slice(currentOffset, currentOffset + this._resolveParam(data, currentOffset, info.length));
            break;

            case "ignore":
                // do nothing here
            break;

            default:
                let value = this.file.read(dataType, offset);

                if(value === null)
                {
                    console.error("Binary_File_Parser OOB: pos: " + realOffset + " @offset " + offset);
                    console.log(info);
                    console.log(data);
                }

                if(info.addValue != null && (info.addValue != "@offset" || value != 0)) {
                    value += this._resolveParam(data, currentOffset, info.addValue);
                }

                result = value;
            break;
        }

        // align offset to N bytes, e.g. offset=14 with alignment=4 => newoffset=16
        if(info.alignment != null)
        {
            let align = this._resolveParam(data, currentOffset, info.alignment);
            this.file.alignTo(align);
        }

        return result;
    }

    /**
     * set a custom funtion for reading data, can be used in a structure file
     * with the attrivute "function" and the name as value, the data type is then ignored
     * @param {String} name 
     * @param {Function} fc first parameter is the file handler, the second the data info, it should also return the resulting value
     */
    setFunction(name, fc)
    {
        this.functions[name] = fc;
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

            if(info.checkValue != null && info.checkValue != data[name])
            {
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
