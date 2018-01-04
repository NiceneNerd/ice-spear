//const Binary_File_Parser = require.main.require('./lib/binary_file/structure_parser.js');

module.exports = class Editor_Hex
{
    constructor(node, parser, entry)
    {
        this.info = {
            name: "Hex-Editor"
        };

        this.node = node;
        this.entry = entry;
        this.parser = parser;
        this.file = this.parser.file;

        this.loadData();
    }

    loadData()
    {
        console.log(this.entry);

        this.file.pos(this.entry.dataPointer);
        let fileOffset = this.file.read("s32") + this.entry.dataPointer;
        let fileLength = this.file.read("u32");

        this.data = this.file.buffer.slice(fileOffset, fileOffset + fileLength);

        this.renderData(fileOffset);
    }

// @TODO start always aligned to 0x16!
//
    renderData(fileOffset)
    {
        let cellCount = 0;
        let htmlString = "";
        let dataSet = true;
        let pos = 0;

        while(dataSet)
        {
            let textValue = "";

            let fileOffsetText = fileOffset.toString(16).toUpperCase();
            htmlString += "<tr>";
            htmlString += "<td>0x" + fileOffsetText + "</td>";
            fileOffset += 16;

            for(let i=0; i<16; ++i)
            {
                if(dataSet && this.data[pos] != null)
                {
                    htmlString += "<td>" + this.data[pos] + "</td>";
                    textValue += String.fromCharCode(this.data[pos]);
                }else{
                    htmlString += "<td></td>";
                    textValue += ".";
                    dataSet = false;
                }

                ++pos;
            }

            htmlString += "<td>" + textValue + "</td>";
            htmlString += "</tr>";
        }

        this.node.querySelector("tbody").innerHTML = htmlString;
    }
};
