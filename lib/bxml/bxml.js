/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*
* Special Thanks to:
* @see https://github.com/jam1garner/aamp2xml
*/

const fs = require('fs');
const Binary_File_Parser = requireGlobal('./lib/binary_file/structure_parser.js');
const Binary_File_Loader = requireGlobal('./lib/binary_file/file_loader.js');

module.exports = class BXML
{
    constructor()
    {
        this.dataTypes = require("./data_types.json");
    }

    _parseNode()
    {
        let node = {};
        let nodeOffset = this.file.pos();

        node.id = this.file.read("u32");
        node.dataOffset  = (this.file.read("u16") * 4) + nodeOffset;
        node.childCount  = this.file.read("u8");
        node.dataType    = this.file.read("u8");

        this.file.posPush();
        this.file.pos(node.dataOffset);

        if(node.childCount > 0)
        {
            node.children = [];
            for(let i=0; i<node.childCount; ++i)
            {
                node.children.push(this._parseNode());
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
                console.log("ID: " + node.id);
                console.log("Value: " + node.value);
            }
        }

        this.file.posPop();
        return node;
    }

    parse(pathOrBuffer)
    {
        this.parser = new Binary_File_Parser(pathOrBuffer);

        this.file = this.parser.file;
        this.file.setEndian("little");
        this.header = this.parser.parse(require("./header.json"));

        console.log(this.header.node);

        //let offset = (this.header.node.dataOffset * 4) + this.header.node.nodeOffset + 8;
        let offset = (this.header.node.dataOffset * 4) + this.header.node.nodeOffset;
        //let offset = (this.header.node.dataOffset * 4) + (this.file.pos() - 8 - 2);
        console.log(offset);
        this.file.pos(offset);
        this.header.node.children = this._parseNode();

        console.log(this.header);
    }
};