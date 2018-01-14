/**
* @author Max Bebök
*/

const Binary_File = require.main.require("./lib/binary_file/file_handler.js");

module.exports = class FMDL_Parser
{
    constructor(bfresFileParser)
    {
        this.parser = bfresFileParser;
        this.header = null;
        this.primitypeTypes = require("./primitive_types.json");
        this.bufferTypes    = require("./buffer_types.json");
        this.bufferFormat   = require("./buffer_format.json");
        this.indexTypes     = require("./index_types.json");

        this.models = {};
    }

    convertType(val, typeIn, typeOut)
    {
        if(typeIn == typeOut)
            return val;

        return val;
    }

    parse()
    {
        try{
            this.parseHeader();

            this.models = {};

            this.parseVertexData();
            this.parsePolyShape();

            console.log(this.models);
            console.log(this.header);

        } catch (err) {
            console.warn(`FMDL::parse Exception: ${err}`);
            return false;
        }

        return true;
    }

    parseHeader()
    {
        this.header = this.parser.parse(require("./header.json"));
    }

    parsePolyShape()
    {
        for(let index of this.header.fshpIndex)
        {
            let isFirst = true;
            for(let entry of index.entries)
            {
                if(!isFirst)
                {
                    this.parser.pos(entry.dataPointer);
                    let fshpData = this.parser.parse(require("./fshp.json"));

                    if(fshpData.lodModel.length > 0)
                    {
                        let lodModel = fshpData.lodModel[0];

                        // get index type info
                        let format = this.indexTypes[lodModel.indexFormat];
                        format.size = this.parser.file.types[format.type].size;

                        let indexCount = lodModel.indexBuffer.buffer.length / format.size;
                        let indexIndex = 0;
                        let indexArray = format.size == 2 ? (new Uint16Array(indexCount)) : (new Uint32Array(indexCount));

                        let primitypeInfo = this.primitypeTypes[lodModel.primitypeType];
                        let bufferReader  = new Binary_File(lodModel.indexBuffer.buffer);

                        bufferReader.setEndian(format.endian);

                        for(let i=0; i<indexCount; ++i)
                            indexArray[i] = bufferReader.read(format.type);

                        //let modelNumber = fshpData.fvtxIndex;
                        let modelNumber = fshpData.sectionIndex;

                        // add to model data
                        if(this.models[modelNumber] == null) {
                            this.models[modelNumber] = {};
                        }
                        this.models[modelNumber].indexArray = indexArray;

                    }
                }

                isFirst = false;
            }
        }
    }

    parseVertexData()
    {
        for(let fvtxData of this.header.fvtxData)
        {
            for(let attr of fvtxData.attributes)
            {
                let bufferHeader = fvtxData.buffer[attr.bufferIndex];
                this.parser.pos(bufferHeader.dataOffset + attr.bufferOffset);

                let formatInfo = this.bufferFormat[attr.format];
                if(formatInfo == null)
                    throw `FMDL: unknown buffer format: ${attr.format}`;

                let bufferType = this.bufferTypes[attr.name];

                if(bufferType.bufferName == null)
                    continue;

                let nameArray  = bufferType.bufferName + "Array";
                let nameIndex  = bufferType.bufferName + "Index";

                if(this.models[fvtxData.sectionIndex] == null) {
                    this.models[fvtxData.sectionIndex] = {};
                }

                let model = this.models[fvtxData.sectionIndex];
                model[nameIndex] = 0;
                model[nameArray] = new Float32Array(fvtxData.vertexCount * bufferType.size);

                for(let vertexNum=0; vertexNum<fvtxData.vertexCount; ++vertexNum)
                {
                    for(let i=0; i<formatInfo.count; ++i)
                    {
                        let rawVal = this.parser.file.read(formatInfo.typeIn);

                        if(i < bufferType.size)
                            model[nameArray][model[nameIndex]++] = this.convertType(rawVal, formatInfo.typeIn, formatInfo.typeOut);
                    }
                }
            }
        }
    }
};
