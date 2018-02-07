/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs');
const Binary_File_Parser = requireGlobal('./lib/binary_file/binary_file_parser.js');
const Binary_File_Loader = requireGlobal('./lib/binary_file/file_loader.js');

module.exports = class BYAML
{
    constructor()
    {
        this.TYPE_ARRAY_NODE      = 0xC0;
        this.TYPE_DICTIONARY_NODE = 0xC1;
        this.TYPE_STRING_TABLE    = 0xC2;

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
            console.error("BYAML: invalid name table node type: " + type);
        }
        return [];
    }

    _parseNodeEntry(nodeEntry)
    {
        this._parseNodeEntryValues(nodeEntry);

        if(nodeEntry.node != null){
            return nodeEntry.node;
        }

        // @TODO: wrap value in class defining the type
        return nodeEntry.value;
    }

    _parseNodeEntryValues(nodeEntry)
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
                nodeEntry.value = this.getString(this.file.read("u32"));
            }else{
                nodeEntry.value = this.file.read(nodeType.dataType);
            }
        }
        return nodeEntry;
    }

    _parseNode(type, offset)
    {
        let node = {
            type, offset,
            numEntries: this.file.read("u24")
        };

        switch(type)
        {
            case this.TYPE_ARRAY_NODE:
                node.children = new Array(node.numEntries);

                for(let e=0; e<node.numEntries; ++e)
                    node.children[e] = {type: this.file.read("u8")};

                this.file.alignTo(4);

                for(let nodeIdx in node.children)
                    node.children[nodeIdx] = this._parseNodeEntry(node.children[nodeIdx]);

            break;

            case this.TYPE_DICTIONARY_NODE:
                node.children = {};

                for(let e=0; e<node.numEntries; ++e)
                {
                    let nodeEntry = {
                        name: this.getName(this.file.read("u24")),
                        type: this.file.read("u8")
                    };

                    node.children[nodeEntry.name] = this._parseNodeEntry(nodeEntry);
                }
            break;

            case this.TYPE_STRING_TABLE:
                node.children = new Array(node.numEntries);

                for(let i=0; i<node.numEntries; ++i)
                {
                    let offset = this.file.read("u32") + node.offset;
                    node.children[i] = this.file.readString(-1, offset);
                }
            break;

            default:
                console.log("Unknown Type: 0x" + type);
            break;
        }

        return node.children;
    }

    parseNodes()
    {
        let startOffset = this.file.pos();
        let type = this.file.read("u8");

        return this._parseNode(type, startOffset);
    }
};
