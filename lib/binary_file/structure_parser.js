/**
* @author Max Bebök
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

    _readInfo(data, info, offset = -1)
    {
        let oldPos = this.pos();

        if(offset != -1 && info.addOffset)
        {
            offset += parseInt(info.addOffset);
            oldPos = offset;
        }

        if(info.type == "string")
        {
            let length = typeof(info.length) == "string" ? parseInt(data[info.length]) : info.length;
            if(length > 100)length = 100;
            return this.file.readString(length, offset);
        }
        else if(info.type == "structure")
        {
            return this.parse(info.structure);
        }

        let value = this.file.read(info.type, offset);

        if (info.addValue != null) {
            if(typeof(info.addValue) == "string")
                value += (info.addValue == "@offset") ? oldPos : parseInt(data[info.addValue]);
            else
                value += parseInt(info.addValue);
        }

        return value;
    }

    _readBOM()
    {
        let bom =  [this.file.read("u8"), this.file.read("u8")];
        this.file.setEndian((bom[0] == 0xFE) ? "big" : "little");
    }

    parse(fileStruct)
    {
        let data = {};

        for(let name in fileStruct)
        {
            let info = fileStruct[name];
            let offset = -1;

            if(info.type == "bom")
            {
                this._readBOM();
                continue;
            }

            // @TODO use genereal function to resolve value of settings (strings and fix values)

            if(info.setOffset != null)
                this.pos(typeof(info.setOffset) == "string" ? data[info.setOffset] : parseInt(info.setOffset));

            if(info.offset != null)
                offset = typeof(info.offset) == "string" ? data[info.offset] : parseInt(info.offset);

            if(info.count == null){
                data[name] = this._readInfo(data, info, offset);
            }else{
                let count = typeof(info.count) == "string" ? parseInt(data[info.count]) : info.count;

                data[name] = new Array(count);
                for(let i=0; i<count; ++i){
                    data[name][i] = this._readInfo(data, info, offset);
                }
            }
        }

        return data;
    }
};
