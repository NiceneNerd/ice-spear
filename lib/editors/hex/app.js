const BinaryFile = require('./../../binary_file.js');

module.exports = class Editor_Hex
{
    constructor(node, data)
    {
        this.info = {
            name: "Hex-Editor"
        };

        this.node = node;
        this.entry = data;
        this.file = null;
        this.data = [];

        this.loadData();
    }

    async openFile()
    {
        let bfresFilePath = this.entry.parser.bfresFile.path;
        this.file = new BinaryFile(bfresFilePath, 'r', false); // @TODO read from file
        await this.file.open();
    }

    async loadData()
    {
        await this.openFile();
        await this.file.seek(this.entry.dataPointer);

        let fileOffset = await this.file.readInt32() + this.entry.dataPointer;
        let fileLength = await this.file.readUInt32();

        await this.file.seek(fileOffset);
        this.data = await this.file.readUInt8Array(fileLength);

        this.renderData(fileOffset);

        await this.file.close();
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
