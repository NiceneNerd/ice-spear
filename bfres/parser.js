/**
* @author Max Bebök
*/

const BinaryFile = require('../lib/binary_file.js');

const BFRES_Header       = require('./header.js');
const BFRES_Index_Header = require('./index_header.js');
const BFRES_Index_Entry  = require('./index_entry.js');

module.exports = class BFRES_Parser
{
    constructor()
    {
        this.bfresFile = null;

        this.header = new BFRES_Header();
        this.files = [];
    }

    async parseHeader()
    {
        this.header.magic   = await this.bfresFile.readString(4);
        this.header.version = await this.bfresFile.readUInt8Array(4);
        this.header.bom     = await this.bfresFile.readUInt8Array(2);

        // handle different endians from now on in the file
        //bfresFile.setEndian((header.bom[0] == 0xFE) ? h2::Endian::Big : h2::Endian::Little);

        this.header.headerLength  = await this.bfresFile.readUInt16();
        this.header.fileLength    = await this.bfresFile.readUInt32();
        this.header.fileAlignment = await this.bfresFile.readUInt32();

        this.header.fileNameOffset = this.bfresFile.tell() + await this.bfresFile.readUInt32();

        this.header.stringTableLength = await this.bfresFile.readInt32();
        this.header.stringTableOffset = this.bfresFile.tell() + await this.bfresFile.readInt32();

        this.header.fileOffsets = await this.bfresFile.readInt32Array(this.header.FILE_TABLE_SIZE);
        this.header.fileCounts  = await this.bfresFile.readUInt16Array(this.header.FILE_TABLE_SIZE);

        for(let i=0; i<this.header.FILE_TABLE_SIZE; ++i)
        {
            if(this.header.fileOffsets[i] != 0)
                this.header.fileOffsets[i] += this.header.FILE_POS_OFFSET + (i * 4);
        }

        this.header.userPointer = await this.bfresFile.readUInt32();

        // read additional data
        let fileNameLength = await this.bfresFile.readUInt32(this.header.fileNameOffset - 4);
        this.header.fileName = await this.bfresFile.readString(fileNameLength, this.header.fileNameOffset);
    }

    async parseFileTable()
    {
        for(let type=0; type<this.header.FILE_TABLE_SIZE; ++type)
        {
            let tablePos = this.header.fileOffsets[type];
            if(tablePos == 0)
                continue;

            this.bfresFile.seek(tablePos);

            let indexHeader = new BFRES_Index_Header();
            indexHeader.length   = await this.bfresFile.readUInt32();
            indexHeader.entryNum = await this.bfresFile.readInt32();

            for(let i=0; i<=indexHeader.entryNum; ++i)
            {
                let indexEntry = new BFRES_Index_Entry(type);

                indexEntry.searchValue = await this.bfresFile.readUInt32();
                indexEntry.leftIndex   = await this.bfresFile.readUInt16();
                indexEntry.rightIndex  = await this.bfresFile.readUInt16();

                indexEntry.namePointer = this.bfresFile.tell() + await this.bfresFile.readInt32();
                indexEntry.dataPointer = this.bfresFile.tell() + await this.bfresFile.readInt32();

                if(i != 0)
                {
                    indexEntry.parser = this;
                    this.files.push(indexEntry);
                }
            }
        }

        return true;
    }

    async parse(filePath)
    {
        try{
            this.bfresFile = new BinaryFile(filePath, 'r', false); // @TODO read from file
            await this.bfresFile.open();

            await this.parseHeader();
            await this.parseFileTable();

            await this.bfresFile.close();

        } catch (err) {
            console.log(`BFRES::parse Exception: ${err}`);
        }
    }
};
