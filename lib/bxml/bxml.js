/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*
* Special Thanks to:
* @see https://github.com/jam1garner/aamp2xml
*/

const fs = require('fs');
const Binary_File_Parser  = requireGlobal('./lib/binary_file/binary_file_parser.js');
const Binary_File_Creator = requireGlobal('./lib/binary_file/binary_file_creator.js');
const Binary_File_Loader  = requireGlobal('./lib/binary_file/file_loader.js');

module.exports = class BXML
{
    /**
     * @param {String_Table} global string table, can be NULL
     */
    constructor(stringTable = null)
    {
        this.dataTypes   = require("./data_types.json");
        this.stringTable = stringTable;
    }

    _parseCRC(file, info = null)
    {
        let hash = "";

        for(let i=0; i<4; ++i)
            hash = file.read("u8").toString(16).padStart(2, "0") + hash;

        return hash;
    }

    _parseNode()
    {
        let node = {};
        let nodeOffset = this.file.pos();

        node.id = this._parseCRC(this.file);

        if(this.stringTable != null)
            node.name = this.stringTable.getString(node.id);

        if(node.name == null)
            node.name = "[CRC:" + node.id+"]";

        node.dataOffset  = (this.file.read("u16") * 4) + nodeOffset;
        node.childCount  = this.file.read("u8");
        node.dataType    = this.file.read("u8");

        this.file.posPush();
        this.file.pos(node.dataOffset);

        if(node.childCount > 0)
        {
            node.value = {};
            for(let i=0; i<node.childCount; ++i)
            {
                let newNode = this._parseNode();
                node.value[newNode.name] = newNode.value;
            }
            
        }else{
            let typeInfo = this.dataTypes[node.dataType];
            if(typeInfo == null)
            {
                console.warn(`BXML: unknown data type: '${node.dataType}'`);
            }else{

                let count = typeInfo.count == null ? 0 : typeInfo.count;
                
                if(typeInfo.type == "string")
                {
                    node.value = this.file.readString();
                }else{
                    node.value = this.file.read(typeInfo.type);
                }
                /*
                console.log("ID: " + node.id);
                console.log("Name: " + node.name);
                console.log("Value: " + node.value);
                console.log("");
                */
            }
        }

        this.file.posPop();
        return node;
    }

    /**
     * parses a BXML file and returns it as JSON
     * Note: node names onl work correctly if a string table is provided in the constructor
     * otherwise it can't resolve the hases to their names
     * @param {String|Buffer} pathOrBuffer 
     */
    parse(pathOrBuffer)
    {
        this.parser = new Binary_File_Parser(pathOrBuffer);
        this.parser.setFunction("crc32", this._parseCRC);

        this.file = this.parser.file;
        this.file.setEndian("little");
        this.header = this.parser.parse(require("./header.json"));

        let offset = (this.header.node.dataOffset * 4) + this.header.node.nodeOffset;
        this.file.pos(offset);

        let nodeObj = {};
        for(let node of this.header.node)
        {
            if(this.stringTable != null)
                node.name = this.stringTable.getString(node.id);

            let subNode = this._parseNode();
            nodeObj[subNode.name] = subNode.value;
        }

        this.header.node = nodeObj;
        return this.header.node;
    }

    /**
     * creates a BXML file from a JSON object
     * @param {Object} data input data
     * @returns a Buffer Object with the binary data
     */
    create(data)
    {  
        let fileCreator = new Binary_File_Creator();
        let header = fileCreator.create("./header.json");
        console.log(header);
    }
};