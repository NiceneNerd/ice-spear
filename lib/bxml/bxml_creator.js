/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*
* Special Thanks to:
* @see https://github.com/jam1garner/aamp2xml
*/

const fs = require('fs');
const Binary_File_Creator = requireGlobal('./lib/binary_file/binary_file_creator.js');
const BXML_Node = require("./bxml_node.js");

const STRING_PADDING = 4;

const SIZE_HEADER    = 52;
const SIZE_ROOT_NODE = 12;
const SIZE_NODE      = 8;

module.exports = class BXML_Creator
{
    constructor()
    {
        this.stringTable = new Map();
        this.dataTable   = new Map();

        this.headerData = {};

        this.offsetDataTable   = 0;
        this.offsetStringTable = 0;

        this.dataTypes = require("./data_types.json");
    }

    _createStringAndDataTable(bxmlNode)
    {
        bxmlNode.forEach( node => 
        {
            let dataTypeInfo = this.dataTypes[node.type];
            if(dataTypeInfo != null && node.hasValue())
            {
                if(dataTypeInfo.type == "string")
                {
                    let str = node.val();
                    if(!this.stringTable.has(str))
                    {
                        this.stringTable.set(str, this.headerData.stringBufferSize);
                        this.headerData.stringBufferSize += Buffer.byteLength(str, "utf8") + 1; // +1 = ending zero
                        this.headerData.stringBufferSize = Math.ceil(this.headerData.stringBufferSize / STRING_PADDING) * STRING_PADDING;
                    }
                }else{
                    let rawVal = node.val() + 0; // @TODO: convert to hex here to avoid int/float confusion when the value is the same
                    if(!this.dataTable.has(rawVal))
                    {
                        this.dataTable.set(rawVal, this.headerData.dataBufferSize);
                        this.headerData.dataBufferSize += dataTypeInfo.size;
                    }
                }
            }
        });
    }

    /**
     * creates a BXML file from a JSON object
     * @param {BXML_Node} bxmlNode input data
     * @returns a Buffer Object with the binary data
     */
    create(bxmlNode = null)
    {  
        if(bxmlNode == null)
            bxmlNode = this.header.node;

        let fileCreator = new Binary_File_Creator();

        let header = require("./header.json");
        this.headerData = {
            rootNodesCount: bxmlNode.getChildCount(),
            rootChildNodesCount: bxmlNode.getChildCount(true, 1),
            stringBufferSize: 0,
            dataBufferSize: 0
        };

        this.headerData.nodesCount = bxmlNode.getChildCount(true) - this.headerData.rootChildNodesCount;
        this.headerData.rootChildNodesCount -= this.headerData.rootNodesCount;

        this._createStringAndDataTable(bxmlNode);

        this.headerData.fileSize = SIZE_HEADER + 
            (SIZE_ROOT_NODE * this.headerData.rootNodesCount) +
            (SIZE_NODE      * (this.headerData.nodesCount + this.headerData.rootChildNodesCount)) +
            this.headerData.dataBufferSize +
            this.headerData.stringBufferSize;

        console.log(this.headerData);

        let buffer = fileCreator.write(header, this.headerData);
        return buffer;
    }
};