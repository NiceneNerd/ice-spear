/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs');
const Binary_File_Creator = requireGlobal('./lib/binary_file/binary_file_creator.js');
const BYAML_Value = require("./byaml_value.js");
const String_Table = require("./string_table.js");

module.exports = class BYAML_Creator
{
    constructor()
    {
        this.TYPE_ARRAY_NODE      = 0xC0;
        this.TYPE_DICTIONARY_NODE = 0xC1;
        this.TYPE_STRING_TABLE    = 0xC2;

        this.HEADER_SIZE = 0x10;
        this.NODE_SIZE = 8;

        this.headerData = {};

        this.fileCreator = new Binary_File_Creator();
        this.file = this.fileCreator.file;
        this.file.setEndian("big");

        this.nodeTypes = require("./node_types.json");
        this.headerStructure = require("./header.json");

        this.nameTable   = new String_Table();
        this.stringTable = new String_Table();
    }

    _generateTables(node)
    {
        if(node instanceof BYAML_Value)
        {
            if(typeof(node.value) == "string")
                this.stringTable.add(node.value);
        }else{
            for(let name in node)
            {
                if(!(node instanceof Array))
                    this.nameTable.add(name);

                this._generateTables(node[name]);
            }
        }
    }

    _writeStringTableNode(entries)
    {
        this.file.write("u8", this.TYPE_STRING_TABLE);
        this.file.write("u24", entries);
    }

    _writeTable(table)
    {
        this.fileCreator.pos(table.offset);
        table.forEach((offset, name) => 
        {
            this.file.writeString(name);
        });
    }

    _writeTableNodes(table, offset)
    {
        this.file.pos(offset);
        this._writeStringTableNode(table.count());
        let offsetDiff = table.offset - offset;

        table.forEach((offset, name) => 
        {
            this.file.write("u32", offset + offsetDiff);
        });
        this.file.write("u32", table.size() + offsetDiff);
    }

    _getNodeType(node)
    {
        if(node instanceof BYAML_Value)
        {
            return node.type;
        }
        return (Array.isArray(node)) ? this.TYPE_ARRAY_NODE : this.TYPE_DICTIONARY_NODE;
    }

    _writeNode(node)
    {
        let nodeType = this._getNodeType(node);
        let nextFreeOffset = this.file.pos();

        switch(nodeType)
        {
            case this.TYPE_ARRAY_NODE:

                this.file.write("u8", this.TYPE_ARRAY_NODE);
                this.file.write("u24", node.length);

                for(let subNode of node)
                    this.file.write("u8", this._getNodeType(subNode));

                this.file.alignTo(4);

                nextFreeOffset = this.file.pos() + (node.length * 4);
                for(let subNode of node)
                {
                    nextFreeOffset = this._writeNodeBody(subNode, nextFreeOffset);
                }

            break;
            case this.TYPE_DICTIONARY_NODE:

                let keys = Object.keys(node);
                 
                this.file.write("u8", this.TYPE_DICTIONARY_NODE);
                this.file.write("u24", keys.length);

                nextFreeOffset = this.file.pos() + (keys.length * this.NODE_SIZE);

                for(let key of keys)
                {
                    let subNode = node[key];
                    let subNodeType = this._getNodeType(subNode);

                    this.file.write("u24", this.nameTable.getIndex(key));
                    this.file.write("u8", subNodeType);

                    nextFreeOffset = this._writeNodeBody(subNode, nextFreeOffset);
                }

            break;
            default:
                let typeInfo = this.nodeTypes[node.type];

                if(typeInfo == null)
                    throw `BYAML_Creator: unknown data-type '${node.type}'`;

                if(typeInfo.dataType == "string")
                    this.file.write("u32", this.stringTable.getIndex(node.value));
                else
                    this.file.write(typeInfo.dataType, node.value);
            break;
        }

        return nextFreeOffset;
    }

    _writeNodeBody(node, freeOffset)
    {
        let nextFreeOffset = freeOffset;
        let nodeType = this._getNodeType(node);

        if(nodeType == this.TYPE_DICTIONARY_NODE || nodeType == this.TYPE_ARRAY_NODE)
        {
            this.file.write("u32", freeOffset);

            this.file.posPush();
            this.file.pos(freeOffset);

            nextFreeOffset = this._writeNode(node);

            //nextFreeOffset = this.file.pos();
            this.file.posPop();

        }else{
            this._writeNode(node);
        }

        return nextFreeOffset;
    }

    _calcOffsets()
    {
        this.headerData.nameTableOffset = this.HEADER_SIZE;
        this.nameTable.offset = this.headerData.nameTableOffset + (this.nameTable.count() * 4) + 8;

        this.headerData.stringTableOffset = this.nameTable.offset + this.nameTable.size();
        this.stringTable.offset = this.headerData.stringTableOffset + (this.stringTable.count() * 4) + 8;

        this.headerData.rootNodeOffset = this.stringTable.offset + this.stringTable.size();
    }

    create(node)
    {
        this._generateTables(node);

        this.nameTable.sort();
        this.stringTable.sort();

        this._calcOffsets();
        this._writeTable(this.nameTable);
        this._writeTable(this.stringTable);
console.log(this.nameTable);
        this._writeTableNodes(this.nameTable,   this.headerData.nameTableOffset);
        this._writeTableNodes(this.stringTable, this.headerData.stringTableOffset);

        this.file.pos(this.headerData.rootNodeOffset);
        this._writeNode(node);

        this.file.pos(0);
        return this.fileCreator.write(this.headerStructure, this.headerData);
    }
};
