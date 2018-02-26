/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/
const Binary_File = require('./binary_file.js');

module.exports = class Binary_File_Creator
{
    constructor(startingSize = null)
    {
        this.file = new Binary_File();
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
            return (value == "@offset") ? offset : data[value];

        return parseInt(value);
    }

    _writeSingleValue(data, value, info, offset = -1)
    {
        let realOffset = this.pos();

        if(offset != -1 && info.addOffset)
        {
            offset += parseInt(info.addOffset);
            realOffset = offset;
        }

        let currentOffset = offset < 0 ? realOffset : offset;
        let dataType = info.type;

        switch(dataType)
        {
            case "bom":
                console.log("Binary_File_Creator: TODO: " + dataType);
                /*
                result = [this.file.read("u8"), this.file.read("u8")];
                this.file.setEndian((result[0] == 0xFE) ? "big" : "little");
                */
            break;

            case "string":
                let length = this._resolveParam(data, currentOffset, info.length == null ? -1 : info.length);
                if(length < 0)
                    length = info.value.length;

                for(let i=0; i<length; ++i)
                {
                    let c = (i < value.length) ? value.charCodeAt(i) : 0;
                    this.file.write("u8", c, offset);
                }
            break;

            case "structure":
                console.log("Binary_File_Creator: TODO: " + dataType);
                /*
                if(typeof(info.structure) == "string")
                    info.structure = requireGlobal(info.structure);
          
                    result = this.parse(info.structure);
                */
            break;

            case "buffer":
                console.log("Binary_File_Creator: TODO: " + dataType);
                /*
                result = this.file.buffer.slice(currentOffset, currentOffset + this._resolveParam(data, currentOffset, info.length));
                */
            break;

            case "ignore":
                // do nothing here
            break;

            default:
                if(info.addValue != null && (info.addValue != "@offset" || value != 0)) {
                    value -= this._resolveParam(data, currentOffset, info.addValue);
                }

                if(value === null)
                    value = 0;

                this.file.write(dataType, value, offset);
            break;
        }

        // align offset to N bytes
        if(info.alignment != null)
        {
            let align = this._resolveParam(data, currentOffset, info.alignment);
            this.file.alignTo(align);
        }
    }

    /**
     * set a custom funtion for writing data, can be used in a structure file
     * with the attrivute "function" and the name as value, the data type is then ignored
     * @param {String} name 
     * @param {Function} fc first parameter is the file handler, the second the data info, it should also return the resulting value
     */
    setFunction(name, fc)
    {
        this.functions[name] = fc;
    }

    write(fileStruct, data)
    {
        for(let name in fileStruct)
        {
            let info = fileStruct[name];
            let offset = -1;
            let value = data[name];
            let currentOffset = this.pos();

            let restoreOffset = typeof(info.restoreOffset) != "boolean" ? false : info.restoreOffset;

            if(value == null && info.default != null)
            {
                data[name] = value = info.default;
            }

            if(info.setOffset != null)
                this.pos(this._resolveParam(data, currentOffset, info.setOffset));

            if(info.offset != null)
                offset = this._resolveParam(data, currentOffset, info.offset);

            if(value == null)
                value = info.type == "string" ? "" : 0;

            if(info.count == null){
                this._writeSingleValue(data, value, info, offset);
            }else{
                let count = this._resolveParam(data, currentOffset, info.count);
                /*
                data[name] = new Array(count);
                for(let i=0; i<count; ++i){
                    data[name][i] = this._readSingleValue(data, info, offset);
                }
                */
            }

            if(info.checkValue != null && info.checkValue != value)
            {
                let errorMessage = `Binary_File_Creator: invalid value!\nExpected: '${info.checkValue}', got: '${value}'`;
                console.warn(errorMessage);
                throw errorMessage;
            }

            if(restoreOffset)
                this.pos(currentOffset);
        }

        return this.getBuffer();
    }

    /**
     * returns the internal created buffer
     * Note: it slices the buffer to only contain written data and not the whole pre-buffered size
     */
    getBuffer()
    {
        return this.file.getBuffer();
    }
};
