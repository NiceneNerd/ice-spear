/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Binary_File_Loader = requireGlobal('./lib/binary_file/file_loader.js');
const Tab_Manager        = requireGlobal('./lib/tab_manager.js');
const Theme_Manager      = requireGlobal('./lib/theme_manager.js');
const SARC               = requireGlobal("lib/sarc/sarc.js");
const String_Table       = requireGlobal("lib/string_table/string_table.js");

const electron = require('electron');
const fs       = require('fs');
const path     = require('path');
const url      = require('url');
const Split    = require('split.js');

const {dialog} = electron.remote;
const BrowserWindow = electron.remote.BrowserWindow;

const App_Base = requireGlobal("./apps/base.js");

module.exports = class App extends App_Base
{
    constructor(window, args)
    {
        super(window, args);

        this.stringTable = new String_Table();

        this.footerNode = footer.querySelector(".data-footer");

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
    }

    extractSARC(filePath = null, outputPath = null)
    {
        let path = dialog.showOpenDialog({properties: ['openFile']});
        if(path == null)return false;
        filePath = path[0];

        path = dialog.showOpenDialog({properties: ['openDirectory']});
        if(path == null)return false;
        outputPath = path[0];


        let fileName = filePath.split(/[\\/]+/).pop();

        let sarc = new SARC(this.stringTable);
        let files = sarc.parse(filePath);
        console.log(files);

        sarc.extractFiles(outputPath, fileName + ".unpacked", true);

        return true;
    }

    async run()
    {
        await this.stringTable.load();

        let Aimara = requireGlobal("lib/external/aimara/aimara.js");
        let tree = Aimara("main-tree-files", null, "assets/img/treeview/");

        var node1 = tree.createNode('Node A',false);
       node1.createChildNode('Node A-1', false);
       node1.createChildNode('Node A-2', false).createChildNode('Node A-2-1', false);

       tree.drawTree();

       node1 = tree.createNode('Node-B',false);
       node1.createChildNode('Node-B-1', false);
    }

};
