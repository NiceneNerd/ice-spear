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
        this.indexFormat    = require("./index_format.json");

        this.models = {};
    }

    parse()
    {
        try{
            this.parseHeader();

            this.models = {};

            this.parseVertexData();
            this.parsePolyShape();

        } catch (err) {
            console.error(`FMDL::parse Exception:`);
            console.log(err);
        }
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
                        let format = this.indexFormat[lodModel.indexFormat];
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
            let vertexArray = new Float32Array(fvtxData.vertexCount * 3);
            let vertexIndex = 0;

            for(let attr of fvtxData.attributes)
            {
                let bufferHeader = fvtxData.buffer[attr.bufferIndex];
                this.parser.pos(bufferHeader.dataOffset + attr.bufferOffset);

                for(let vertexNum=0; vertexNum<fvtxData.vertexCount; ++vertexNum)
                {
                    switch(attr.name)
                    {
                        case "_p0":

                            if(attr.format == 2065) // float_32_32_32
                            {
                                for(let i=0; i<3; ++i)
                                    vertexArray[vertexIndex++] = this.parser.file.read("float32");

                                this.parser.file.read("float32");

                            }else if(attr.format == 2063) // float_16_16_16_16
                            {
                                for(let i=0; i<3; ++i)
                                    vertexArray[vertexIndex++] = this.parser.file.read("float16");

                                this.parser.file.read("float16"); // unused W coordinate, always 1.0
                            }else{
                                console.log("FMDL.parseVertexData: unknown attribute format: " + attr.format);
                            }

                        break;

                        default:
                        break;
                    }
                }
            }

            // add to model data
            if(this.models[fvtxData.sectionIndex] == null) {
                this.models[fvtxData.sectionIndex] = {};
            }
            this.models[fvtxData.sectionIndex].vertexArray = vertexArray;
        }
    }
};
