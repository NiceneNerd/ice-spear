/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const Binary_File_Loader = requireGlobal('./lib/binary_file/file_loader.js');
const Tab_Manager        = requireGlobal('./lib/tab_manager.js');
const Theme_Manager      = requireGlobal('./lib/theme_manager.js');

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

    run()
    {
        let Aimara = requireGlobal("lib/external/aimara/aimara.js");
        let tree = Aimara("main-tree-files", null, "file:///assets/img/treeview/");

        var node1 = tree.createNode('Node A',false);
       node1.createChildNode('Node A-1', false);
       node1.createChildNode('Node A-2', false).createChildNode('Node A-2-1', false);

       tree.drawTree();

       node1 = tree.createNode('Node-B',false);
       node1.createChildNode('Node-B-1', false);
    }

};
