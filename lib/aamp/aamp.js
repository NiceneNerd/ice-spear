/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs');
const Binary_File_Parser = requireGlobal('./lib/binary_file/structure_parser.js');
const Binary_File_Loader = requireGlobal('./lib/binary_file/file_loader.js');

module.exports = class AAAMP
{
    constructor()
    {
        this.fileLoader = new Binary_File_Loader();
        this.nodeTypes = require("./node_types.json");

        this.files = {};
        this.names = [];
        this.stringTable = [];
    }

    getName(index)
    {
        return index < this.names.length ? this.names[index] : "";
    }

    getString(index)
    {
        return index < this.stringTable.length ? this.stringTable[index] : "";
    }

    parse(pathOrBuffer)
    {
        this.parser = new Binary_File_Parser(pathOrBuffer);
        this.file = this.parser.file;
        this.file.setEndian("big");
        this.header = this.parser.parse(require("./header.json"));

        console.log(this.header);

        this.file.pos(this.header.nameTableOffset);
        this.names  = this._parseStringTable();

        this.file.pos(this.header.stringTableOffset);
        this.stringTable  = this._parseStringTable();

        this.file.pos(this.header.rootNodeOffset);
        return this.parseNodes();
    }

    _parseStringTable()
    {
        let startOffset = this.file.pos();
        let type = this.file.read("u8");
        if(type == 0xC2)
        {
            return this._parseNode(type, startOffset);
        }else{
            console.error("AAMP: invalid name table node type: " + type);
        }
        return [];
    }

    _parseNode(type, startOffset)
    {
        let node = {type, offset: startOffset};

        switch(type)
        {
            case 0xC0: // array node

                node.numEntries = this.file.read("u24");
                node.children = [];
                for(let e=0; e<node.numEntries; ++e)
                {
                    node.children.push({type: this.file.read("u8")});
                }
                this.file.alignTo(4);

                for(let nodeEntry of node.children)
                {
                    let nodeType = this.nodeTypes[nodeEntry.type];
                    if(nodeType.type == "object")
                    {
                        nodeEntry.nodeOffset = this.file.read("u32");
                        this.file.posPush();
                        this.file.pos(nodeEntry.nodeOffset);

                        let type = this.file.read("u8");
                        nodeEntry.node = this._parseNode(type, nodeEntry.nodeOffset);

                        this.file.posPop();
                    }else{
                        if(nodeType.dataType == "string")
                        {
                            this.file.read("u32");
                            nodeEntry.value = this.getString(this.file.read("u32"));
                        }else{
                            nodeEntry.value = this.file.read(nodeType.dataType);
                        }
                    }
                }

            break;

            case 0xC1: // dictionary node
                node.numEntries = this.file.read("u24");
                node.children = {};

                for(let e=0; e<node.numEntries; ++e)
                {
                    let nodePos = this.file.pos();
                    let nodeEntry = {};
                    nodeEntry.nameIndex = this.file.read("u24");
                    nodeEntry.name      = this.getName(nodeEntry.nameIndex);
                    nodeEntry.type      = this.file.read("u8");

                    let nodeType = this.nodeTypes[nodeEntry.type];
                    if(nodeType.type == "object")
                    {
                        //nodeEntry.nodeOffset = this.file.read("u32") + nodePos;
                        nodeEntry.nodeOffset = this.file.read("u32");
                        this.file.posPush();
                        this.file.pos(nodeEntry.nodeOffset);

                        let type = this.file.read("u8");
                        nodeEntry.node = this._parseNode(type, nodeEntry.nodeOffset);

                        this.file.posPop();

                    }else{
                        if(nodeType.dataType == "string")
                        {
                            nodeEntry.value = this.getString(this.file.read("u32"));
                        }else{
                            nodeEntry.value = this.file.read(nodeType.dataType);
                        }
                    }

                    //node.children.push(nodeEntry);
                    node.children[nodeEntry.name] = nodeEntry; // Test if unique
                }
            break;

            case 0xC2: // string table
                let num = this.file.read("u24");
                let textArr = [];

                for(let i=0; i<num; ++i)
                {
                    let offset = this.file.read("u32") + startOffset;
                    textArr.push(this.file.readString(-1, offset));
                }

                return textArr;
            break;

            default:
                console.log("Unknown Type: 0x" + type);
            break;
        }

        return node;
    }

    parseNodes()
    {
        let startOffset = this.file.pos();
        let type = this.file.read("u8");

        return this._parseNode(type, startOffset);
    }
};
