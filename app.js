/**
* @author Max Bebök
*/

const Binary_File_Loader = require('./lib/binary_file/file_loader.js');
const BFRES_Parser   = require('./bfres/parser.js');
const BFRES_Renderer = require('./bfres/renderer.js');
const Tab_Manager    = require('./lib/tab_manager.js');

const {dialog} = require('electron').remote;
const fs       = require('fs');

module.exports = class App
{
    constructor(args)
    {
        this.args       = args;
        this.tabManager = null;
        this.filePath   = "";
        this.fileLoader = new Binary_File_Loader();

        this.footerNode = footer.querySelector(".data-fileName");

        this.clear();
    }

    clear()
    {
        if(this.bfresRenderer != null)
            this.bfresRenderer.clear();

        if(this.tabManager != null)
            this.tabManager.clear();

        this.bfresParser    = null;
        this.bfresTexParser = null;
        this.bfresRenderer  = null;
    }

    openFileDialog()
    {
        let path = dialog.showOpenDialog({
            //properties: ['openDirectory']
            properties: ['openFile']
        });

        if(path != null)
            return path[0];

        return "";
    }

    scanTextureFile(num = 1)
    {
        if(num > 3)
            return false;

        let fileParts = this.filePath.split(".");
        fileParts[fileParts.length-1] =  `Tex${num}.` + fileParts[fileParts.length-1];
        let texPath = fileParts.join(".");

        // prevent loading texture if a texture file is already opened
        if(fileParts.length > 2 && fileParts[fileParts.length-2].substr(0, 3) == "Tex")
        {
            return false;
        }

        if (this.filePath != texPath && fs.existsSync(texPath)) {
            this.openTextureFile(texPath);
            return true;
        }

        return this.scanTextureFile(num + 1);
    }

    openTextureFile(texPath)
    {
        console.log("Tex-File: " + texPath);

        let buffer = this.fileLoader.buffer(texPath);
        this.bfresTexParser = new BFRES_Parser(true);
        if(this.bfresTexParser.parse(buffer))
        {
        }
    }

    openFile(filePath)
    {
        if(filePath == "" || filePath == null)
            filePath = this.openFileDialog();

        if(filePath == "")
            return false;

        this.clear();

        let buffer = this.fileLoader.buffer(filePath);

        //fs.writeFileSync(filePath + ".unpacked", buffer); // @TODO move un-packer to extra function / also in UI

        this.bfresParser = new BFRES_Parser();
        if(this.bfresParser.parse(buffer))
        {
            this.filePath = filePath;
            this.footerNode.innerHTML = "File loaded: " + this.filePath;

            this.scanTextureFile();

            this.bfresRenderer = new BFRES_Renderer(bfres_tab_1);
            this.bfresRenderer.render(this.bfresParser);
            return true;
        }

        return false;
    }

    run()
    {
        //let yaz0 = require("yaz0-js");
        //console.log(yaz0);

        this.tabManager = new Tab_Manager(tab_tabContainer_bfres, tab_contentContainer_bfres);
        this.tabManager.init();

        let filePath = "";
        if(this.args[2] != null) {
            //filePath = args[2];
        }

        filePath = "M:/Documents/roms/wiiu/unpacked/TEST/Dungeon001/Model/DgnMrgPrt_Dungeon001.sbfres";
        //filePath = "/home/max/Documents/TEST/DgnObj_AncientBallSwitch_A-00.bin";
        //filePath = "/home/max/Documents/TEST/DgnObj_AncientBallSwitch_A.Tex1.bin.bfres";
        //filePath = "/home/max/Documents/TEST/Obj_TreeGhost_A.Tex1.bin";

        //filePath = "/home/max/Documents/TEST/compressed/Animal_Cow.sbfres";

        this.openFile(filePath);

    }
};


/*
const {dialog} = require('electron').remote;
let path = dialog.showOpenDialog({
    properties: ['openDirectory']
});
console.log(path);
*/
