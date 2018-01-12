/**
* @author Max Bebök
*/

const BFRES_Parser   = require('./bfres/parser.js');
const BFRES_Renderer = require('./bfres/renderer.js');
const Tab_Manager    = require('./lib/tab_manager.js');
const {dialog}       = require('electron').remote;

module.exports = class App
{
    constructor(args)
    {
        this.args = args;
        this.tabManager = null;

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

        this.bfresParser = new BFRES_Parser();
        if(this.bfresParser.parse(filePath))
        {
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

        //let fileName = "M:/Documents/roms/wiiu/unpacked/The Legend of Zelda Breath of the Wild [ALZP0101]/content/Pack/Dungeon001/Model/DgnMrgPrt_Dungeon001.bin";
        let fileName = "/home/max/Documents/TEST/Dungeon001/Model/DgnMrgPrt_Dungeon001.bin";

        if(this.args[2] != null) {
            //fileName = args[2];
        }

        //fileName = "/home/max/Documents/TEST/Dungeon001/Model/DgnMrgPrt_Dungeon001.bin";
        fileName = "/home/max/Documents/TEST/DgnObj_AncientBallSwitch_A.Tex1.bin.bfres"
        //fileName = "/home/max/Documents/TEST/Obj_TreeGhost_A.Tex1.bin";

    }
};


/*
const {dialog} = require('electron').remote;
let path = dialog.showOpenDialog({
    properties: ['openDirectory']
});
console.log(path);
*/
