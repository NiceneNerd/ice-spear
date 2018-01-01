/**
* @author Max Bebök
*/

const BinaryFile = require('./../../lib/binary_file.js');

const FMDL_Header = require('./header.js');

module.exports = class FMDL_Parser
{
    constructor()
    {
        this.fmdlFile = null;
        this.header = new FMDL_Header();
    }

    async parseHeader()
    {
        this.header.magic = await this.fmdlFile.readString(4);
        if(this.header.magic != "FMDL")
        {
            alert("FMDL File: invalid magic!");
            return false;
        }

        //@TODO use json to parse
        this.header.fileNameOffset = this.fmdlFile.tell() + await this.fmdlFile.readInt32();
        this.header.filePathOffset = this.fmdlFile.tell() + await this.fmdlFile.readInt32();

        this.header.fsklOffset = this.fmdlFile.tell() + await this.fmdlFile.readInt32();
        this.header.fvtxOffset = this.fmdlFile.tell() + await this.fmdlFile.readInt32();
        this.header.fshpOffset = this.fmdlFile.tell() + await this.fmdlFile.readInt32();
        this.header.fmatOffset = this.fmdlFile.tell() + await this.fmdlFile.readInt32();
        this.header.userDataOffset = this.fmdlFile.tell() + await this.fmdlFile.readInt32();

        this.header.fvtxCount = await this.fmdlFile.readUInt16();
        this.header.fshpCount = await this.fmdlFile.readUInt16();
        this.header.fmatCount = await this.fmdlFile.readUInt16();
        this.header.userDataCount = await this.fmdlFile.readUInt16();

        this.header.vertexCount = await this.fmdlFile.readUInt32();
        this.header.userPointer = await this.fmdlFile.readUInt32();

        // read additional data
        let fileNameLength = await this.fmdlFile.readUInt32(this.header.fileNameOffset - 4);
        this.header.fileName = await this.fmdlFile.readString(fileNameLength, this.header.fileNameOffset);

        let filePathLength = await this.fmdlFile.readUInt32(this.header.filePathOffset - 4);
        this.header.filePath = await this.fmdlFile.readString(filePathLength, this.header.filePathOffset);

        console.log(this.header);
    }

    async parse(filePath, position)
    {
        try{
            this.fmdlFile = new BinaryFile(filePath, 'r', false); // @TODO read from file
            await this.fmdlFile.open();
            await this.fmdlFile.seek(position);

            await this.parseHeader();

            await this.fmdlFile.close();

        } catch (err) {
            console.log(`FMDL::parse Exception: ${err}`);
        }
    }
};
