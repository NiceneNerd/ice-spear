/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs');
const Binary_File_Creator = require('binary-file').Creator;
const BYAML_Value = require("./byaml_value.js");
const String_Table = require("./string_table.js");
const crypto = require('crypto');

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

        this.nodeOffsets = {};
    }

    /**
     * adds a node offset with the hash of it's content as key.
     * used to check for identical nodes and use their offset instead of saving them again
     * @param {Object} node 
     * @param {Number} offset 
     */
    _addNodeOffsetEntry(node, offset)
    {
        let nodeStr = JSON.stringify(node);
        const hash = crypto.createHmac('sha256', "").update(nodeStr).digest('hex');

        if(this.nodeOffsets[hash] == null)
            this.nodeOffsets[hash] = offset;

        return this.nodeOffsets[hash];
    }

    /**
     * generates the string and name table
     * @param {Object} node 
     */
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

    /**
     * writes the small node header incl. type and number of entries
     * @param {Number} type 
     * @param {Number} numEntries 
     */
    _writeNodeHeader(type, numEntries)
    {
        this.file.write("u8", type);
        this.file.write("u24", numEntries);
    }

    /**
     * writes a string table at it's offset
     * @param {String_Table} table 
     */
    _writeTable(table)
    {
        this.fileCreator.pos(table.offset);
        table.forEach((offset, name) => 
        {
            this.file.writeString(name);
        });
    }

    /**
     * writes the nodes for a string table
     * @param {String_Table} table 
     * @param {Number} offset 
     */
    _writeTableNodes(table, offset)
    {
        this.file.pos(offset);
        this._writeNodeHeader(this.TYPE_STRING_TABLE, table.count());
        let offsetDiff = table.offset - offset;

        table.forEach((offset, name) => 
        {
            this.file.write("u32", offset + offsetDiff);
        });
        this.file.write("u32", table.size() + offsetDiff);
    }

    /**
     * returns the BYAML data/node type
     * @param {Object} node 
     */
    _getNodeType(node)
    {
        if(node instanceof BYAML_Value)
        {
            return node.type;
        }
        return (Array.isArray(node)) ? this.TYPE_ARRAY_NODE : this.TYPE_DICTIONARY_NODE;
    }

    /**
     * writes a node and it's children, this is called recursively
     * @param {Object} node 
     */
    _writeNode(node)
    {
        let nodeType = this._getNodeType(node);
        let nextFreeOffset = this.file.pos();

        switch(nodeType)
        {
            case this.TYPE_ARRAY_NODE:

                this._writeNodeHeader(this.TYPE_ARRAY_NODE, node.length);

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
                this._writeNodeHeader(this.TYPE_DICTIONARY_NODE, keys.length);

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

    /**
     * writes the actual node data and it's children
     * @param {Object} node 
     * @param {Number} freeOffset next free offset after the current node data ends
     */
    _writeNodeBody(node, freeOffset)
    {
        let nextFreeOffset = freeOffset;
        let nodeType = this._getNodeType(node);

        if(nodeType == this.TYPE_DICTIONARY_NODE || nodeType == this.TYPE_ARRAY_NODE)
        {
            let duplicateOffset = this._addNodeOffsetEntry(node, freeOffset);

            this.file.write("u32", duplicateOffset);

            if(freeOffset == duplicateOffset)
            {
                this.file.posPush();
                this.file.pos(freeOffset);

                nextFreeOffset = this._writeNode(node);

                this.file.posPop();
            }
        }else{
            this._writeNode(node);
        }

        return nextFreeOffset;
    }

    /**
     * calculate offsets for all tables and node-sections
     */
    _calcOffsets()
    {
        this.headerData.nameTableOffset = this.HEADER_SIZE;
        this.nameTable.offset = this.headerData.nameTableOffset + (this.nameTable.count() * 4) + 8;

        this.headerData.stringTableOffset = this.nameTable.offset + this.nameTable.size();
        this.stringTable.offset = this.headerData.stringTableOffset + (this.stringTable.count() * 4) + 8;

        this.headerData.rootNodeOffset = this.stringTable.offset + this.stringTable.size();
    }

    /**
     * creates a BYAML file and returns the resulting buffer
     * @param {Object} node root node object
     */
    create(node)
    {
        this._generateTables(node);

        this.nameTable.sort();
        this.stringTable.sort();

        this._calcOffsets();
        this._writeTable(this.nameTable);
        this._writeTable(this.stringTable);

        this._writeTableNodes(this.nameTable,   this.headerData.nameTableOffset);
        this._writeTableNodes(this.stringTable, this.headerData.stringTableOffset);

        this.file.pos(this.headerData.rootNodeOffset);
        this._writeNode(node);

        this.file.pos(0);
        return this.fileCreator.write(this.headerStructure, this.headerData);
    }
};
