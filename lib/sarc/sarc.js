/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs');
const Binary_File_Parser = requireGlobal('./lib/binary_file/structure_parser.js');
const Binary_File_Loader = requireGlobal('./lib/binary_file/file_loader.js');

const AAMP = requireGlobal("lib/aamp/aamp.js");

module.exports = class SARC
{
    constructor()
    {
        this.files = {};
        this.fileLoader = new Binary_File_Loader();
    }

    _createDir(path)
    {
        try{
            fs.mkdirSync(path);
        }catch(e){
            if(e.code != "EEXIST")
                throw e;
        }
    }

    _pathToStructure(pathParts, fileInfo, structObj)
    {
        let part = pathParts.pop();
        if(part === null)
            return false;

        if(structObj[part] == null)
        {
            if(pathParts.length == 0)
            {
                structObj[part] = fileInfo;
            }else{
                structObj[part] = {};
            }
        }

        if(pathParts.length > 0)
        {
            this._pathToStructure(pathParts, fileInfo, structObj[part]);
        }

        return true;
    }

    parse(pathOrBuffer)
    {
        let buffer = this.fileLoader.buffer(pathOrBuffer);
        this.parser = new Binary_File_Parser(buffer);
        this.header = this.parser.parse(require("./header.json"));
        console.log(this.header); // @TODO handle file flags with diffrent name offset

        for(let i=0; i<this.header.sfat.nodeCount; ++i)
        {
            let fileName = this.header.sfat.fileNames[i];
            let fileInfo = this.header.sfat.nodes[i];
            fileInfo.constructor = function File_Info(){};

            let pathParts = fileName.split("/").reverse();
            this._pathToStructure(pathParts, fileInfo, this.files);
        }

        return this.files;
    }

    extractFiles(path, rootDir = ".", recursive = false, files = this.files)
    {
        if(rootDir != null)
        {
            path = path + "/" + rootDir;
            this._createDir(path);
        }

        for(let name in files)
        {
            let node = files[name];
            let newPath = path + "/" + name;

            if(node.constructor.name == "File_Info")
            {
                let fileBuffer = this.parser.file.buffer.slice(
                    node.dataStart + this.header.dataOffset,
                    node.dataEnd + this.header.dataOffset
                );
                fs.writeFileSync(newPath, fileBuffer);

                if(recursive) // also try to exctract exctracted files
                {
                    let rawMagic = fileBuffer.slice(0,4).toString("utf8");
                    if(rawMagic == "Yaz0")
                    {
                        fs.writeFileSync(newPath + ".unpacked.bin", this.fileLoader.buffer(fileBuffer));
                    }

                    if(this.fileLoader.isCompressed(fileBuffer))
                    {
                        let magic = this.fileLoader.getMagic(fileBuffer);
                        if(magic == "SARC")
                        {
                            let sarc = new SARC();
                            sarc.parse(this.fileLoader.buffer(fileBuffer));
                            sarc.extractFiles(path, name + ".unpacked", recursive);
                        }else if(magic.substr(0,2) == "BY")
                        {
                            let aamp = new AAMP();
                            let aampJson = aamp.parse(this.fileLoader.buffer(fileBuffer));

                            let fileOut = name + ".aamp.json";
                            fs.writeFileSync(fileOut, JSON.stringify(aampJson, null, 4));
                        }
                    }
                }

            }else{
                this._createDir(newPath);
                this.extractFiles(newPath, null, recursive, node);
            }
        }
    }
};
