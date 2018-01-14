/**
* @author Max Bebök
*/

const Binary_File_Loader = require('./lib/binary_file/file_loader.js');
const BFRES_Parser   = require('./bfres/parser.js');
const BFRES_Renderer = require('./bfres/renderer.js');
const Tab_Manager    = require('./lib/tab_manager.js');
const {dialog}       = require('electron').remote;

module.exports = class App
{
    constructor(args)
    {
        this.args       = args;
        this.tabManager = null;
        this.filePath   = "";
        this.fileLoader = new Binary_File_Loader();

        this.clear();
    }

    clear()
    {
        if(this.bfresRenderer != null)
            this.bfresRenderer.clear();

        if(this.tabManager != null)
            this.tabManager.clear();

        this.bfresParser = null;
        this.bfresRenderer = null;
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

    openFile(filePath)
    {
        if(filePath == "" || filePath == null)
            filePath = this.openFileDialog();

        if(filePath == "")
            return false;

        this.clear();

        let buffer = this.fileLoader.buffer(filePath);

        const fs = require("fs");
        fs.writeFileSync(filePath + ".unpacked", buffer);

        this.bfresParser = new BFRES_Parser();
        if(this.bfresParser.parse(buffer))
        {
            this.filePath = filePath;
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

        //filePath = "/home/max/Documents/TEST/Dungeon001/Model/DgnMrgPrt_Dungeon001.bin";
        //filePath = "/home/max/Documents/TEST/DgnObj_AncientBallSwitch_A-00.bin";
        //filePath = "/home/max/Documents/TEST/DgnObj_AncientBallSwitch_A.Tex1.bin.bfres";
        //filePath = "/home/max/Documents/TEST/Obj_TreeGhost_A.Tex1.bin";

        filePath = "/home/max/Documents/TEST/compressed/Animal_Cow.sbfres";

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
