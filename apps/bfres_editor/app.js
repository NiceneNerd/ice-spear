/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Binary_File_Loader = requireGlobal('./lib/binary_file/file_loader.js');
const BFRES_Parser       = requireGlobal('./lib/bfres/parser.js');
const BFRES_Renderer     = requireGlobal('./lib/bfres/renderer.js');
const Tab_Manager        = requireGlobal('./lib/tab_manager.js');

const electron = require('electron');
const fs       = require('fs');
const Split    = require('split.js');

const {dialog} = electron.remote;

const App_Base = requireGlobal("./apps/base.js");

module.exports = class App extends App_Base
{
    constructor(window, args)
    {
        super(window, args);

        this.tabManager = null;
        this.filePath   = "";
        this.fileLoader = new Binary_File_Loader();
        this.footerNode = footer.querySelector(".data-fileName");

        Split(['#main-sidebar-left', '#main-sidebar-right'], {
            sizes     : [50, 50],
            minSize   : 0,
            snapOffset: 60,
            gutterSize: 12
        });

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

        this.bfresParser = new BFRES_Parser(true);
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
        this.tabManager = new Tab_Manager(tab_tabContainer_bfres, tab_contentContainer_bfres);
        this.tabManager.init();

        let filePath = "";
        if(this.args[2] != null) {
            //filePath = args[2];
        }

        //filePath = "M:/Documents/roms/wiiu/unpacked/TEST/Dungeon000/Model/DgnMrgPrt_Dungeon000.sbfres";
        //filePath = "M:/Documents/roms/wiiu/unpacked/TEST/Dungeon000/Model/DgnMrgPrt_Dungeon000.Tex2.sbfres";

        filePath = "M:/Documents/roms/wiiu/unpacked/TEST/TwnObj_FenceWood_A.sbfres"; // alpha
        //filePath = "M:/Documents/roms/wiiu/unpacked/TEST/TwnObj_FenceWood_A.Tex1.sbfres"; // alpha

        //filePath = "M:/Documents/roms/wiiu/unpacked/TEST/unpacked/Animal_Cow.sbfres";
        //filePath = "M:/Documents/roms/wiiu/unpacked/TEST/unpacked/Animal_Cow.Tex1.sbfres";

        //filePath = "/home/max/Documents/TEST/DgnObj_AncientBallSwitch_A-00.bin";
        //filePath = "/home/max/Documents/TEST/DgnObj_AncientBallSwitch_A.Tex1.bin.bfres";
        //filePath = "/home/max/Documents/TEST/Obj_TreeGhost_A.Tex1.bin";

        //filePath = "/home/max/Documents/TEST/compressed/Animal_Cow.sbfres";

        this.openFile(filePath);

    }

};