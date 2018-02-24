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

module.exports = class BXML_Creator
{
    constructor()
    {
        this.dataTypes = require("./data_types.json");
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
        let headerData = {
            rootNodesCount: bxmlNode.getChildCount(),
            rootChildNodesCount: bxmlNode.getChildCount(true, 1)
        };

        // calculate the string section length
        let secStringSize = 0;
        let secDataSize = 0;

        let stringArray = {};
        let dataArray = [];

        bxmlNode.forEach( node => 
        {
            let dataTypeInfo = this.dataTypes[node.type];
            if(dataTypeInfo != null)
            {
                if(dataTypeInfo.type == "string")
                {
                    let str = node.val();
                    if(stringArray[str] == null)
                    {
                        secStringSize += Buffer.byteLength(str, "utf8") + 1; // +1 = ending zero
                        secStringSize = Math.ceil(secStringSize / STRING_PADDING) * STRING_PADDING;
                        stringArray[str] = secStringSize;
                    }
                }else{
                    if(!dataArray.includes(node.val()))
                    {
                        secDataSize += dataTypeInfo.size;
                        console.log(dataTypeInfo);
                        dataArray.push(node.val());
                    }
                }
            }
        });

        // data table length => 72
        console.log(dataArray);
        console.log("secDataSize: " + secDataSize);

        headerData.nodesCount = bxmlNode.getChildCount(true) - headerData.rootChildNodesCount;
        headerData.rootChildNodesCount -= headerData.rootNodesCount;
        headerData.stringBufferSize = secStringSize;

        let buffer = fileCreator.write(header, headerData);
        return buffer;
    }
};