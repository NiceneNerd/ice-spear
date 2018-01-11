/**
* @author Max Bebök
*/

const BFRES_FileTypes = require.main.require("./bfres/file_types.js");

module.exports = class Editor_Texture
{
    constructor(node, parser, entry)
    {
        this.info = {
            name: "Texture-Editor"
        };

        this.node   = node;
        this.entry  = entry;
        this.parser = parser;
        this.file   = this.parser.file;

        this.ftexParser = null;

        this.loadData();
    }

    loadData()
    {
        let fileInfo = BFRES_FileTypes.info[this.entry.type];
        const Parser_Class = require.main.require(fileInfo.parser);

        this.ftexParser = new Parser_Class(this.parser, this.entry);

        if(this.ftexParser.parse())
        {
            this.renderImage();
        }

        this.renderData();
    }

    renderData(fileOffset)
    {
        let ftex = this.ftexParser.header;

        this.node.querySelector(".data-header-fileName").innerHTML = ftex.fileName;
        this.node.querySelector(".data-header-filePath").innerHTML = ftex.filePath;
        this.node.querySelector(".data-header-sizeX").innerHTML    = ftex.surface.sizeX;
        this.node.querySelector(".data-header-sizeY").innerHTML    = ftex.surface.sizeY;
        this.node.querySelector(".data-header-sizeZ").innerHTML    = ftex.surface.sizeZ;

        this.node.querySelector(".data-header-mipmapCount").innerHTML   = ftex.surface.mipmapCount;
        this.node.querySelector(".data-header-textureFormat").innerHTML = this.ftexParser.textureTypes[ftex.surface.textureFormat].name;
    }

    renderImage()
    {
        let canvas = this.node.querySelector("canvas");
        let img = this.ftexParser.header.surface;
        canvas.width = img.sizeX;
        canvas.height = img.sizeY;

        let ctx = canvas.getContext('2d');
        let idata = ctx.createImageData(img.sizeX, img.sizeY);

        idata.data.set(img.imageBuffer);
        ctx.putImageData(idata, 0, 0);
    }
};
