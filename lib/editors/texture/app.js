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
        this.ftexParser.parse();

        this.renderData();
        this.renderImage();
    }

    renderData(fileOffset)
    {
        this.node.querySelector(".data-header-fileName").innerHTML = this.ftexParser.header.fileName;
        this.node.querySelector(".data-header-filePath").innerHTML = this.ftexParser.header.filePath;
        this.node.querySelector(".data-header-sizeX").innerHTML = this.ftexParser.header.surface.sizeX;
        this.node.querySelector(".data-header-sizeY").innerHTML = this.ftexParser.header.surface.sizeY;
        this.node.querySelector(".data-header-sizeZ").innerHTML = this.ftexParser.header.surface.sizeZ;
        this.node.querySelector(".data-header-mipmapCount").innerHTML = this.ftexParser.header.surface.mipmapCount;
        this.node.querySelector(".data-header-textureFormat").innerHTML = this.ftexParser.header.surface.textureFormat;
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
