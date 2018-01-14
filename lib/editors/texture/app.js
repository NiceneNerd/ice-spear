/**
* @author Max Bebök
*/

const fs = require("fs");
const {dialog} = require('electron').remote;

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
        this.buttonExportPNG = this.node.querySelector(".data-tool-exportPNG");

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
        this.setToolFunctions();
    }

    exportImage(format)
    {
        let ftex = this.ftexParser.header;
        let img  = this.ftexParser.header.surface;

        // get new file path
        let filePath = dialog.showSaveDialog({
            title: "Export PNG",
            buttonLabel: "Export",
            defaultPath: ftex.fileName + ".png",
            filters: [
                {name: 'PNG', extensions: ['png']},
            ]
        });

        if(filePath == null || filePath == "")
            return;

        this.buttonExportPNG.disabled = true;
        this.buttonExportPNG.style.opacity = 0.5;

        // save to individual format
        if(format == "png")
        {
            let png = require('lodepng');

            png.encode({
                width : ftex.surface.sizeX,
                height: ftex.surface.sizeY,
                data  : img.imageBuffer
            }).then((pngBuffer) =>
            {
                fs.writeFile(filePath, pngBuffer, (err) =>
                {
                    this.buttonExportPNG.disabled = false;
                    this.buttonExportPNG.style.opacity = 1.0;
                });
            });
        }
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

    setToolFunctions()
    {
        this.buttonExportPNG.onclick = () => {
            this.exportImage("png");
        };
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
