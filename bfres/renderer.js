/**
* @author Max Bebök
*/

const fs = require("fs");

const BFRES_Parser    = require("./parser.js");
const HTML_Loader     = require("../lib/html_loader.js");
const BFRES_FileTypes = require("./file_types.js");

module.exports = class BFRES_Renderer
{
    render(tabNode, bfresFile)
    {
        this.reset(tabNode);

        tabNode.querySelector(".data-header-fileName").innerHTML = bfresFile.header.fileName;
        tabNode.querySelector(".data-header-version").innerHTML = bfresFile.header.version.join(".");

        let listGroup = tabNode.querySelector("#tab_tabContainer");
        let listEntryHtml = new HTML_Loader('./html/bfres_file_tab.html')
        let typeCounter = new Uint32Array(12);

        for(let entry of bfresFile.files)
        {
            let entryNode = listEntryHtml.create();
            let localId = entry.type + "_" + typeCounter[entry.type];

            entryNode.children[0].onclick = function()
            {
                tabManager.open(this, entry.type, localId, entry);
            };

            entryNode.querySelector(".data-fileEntry-type").innerHTML = BFRES_FileTypes.info[entry.type].name;
            entryNode.querySelector(".data-fileType-num").innerHTML = " #" + typeCounter[entry.type];
            entryNode.querySelector(".data-fileEntry-description").innerHTML = BFRES_FileTypes.info[entry.type].description;

            try{
                let imgFilePath = "./assets/img/icons/bfres/filetype_" + entry.type + ".png";
                fs.accessSync(imgFilePath);
                entryNode.querySelector("img").src = imgFilePath;
            } catch(e){
            }

            ++typeCounter[entry.type];
            listGroup.append(entryNode);
        }
    }

    reset(tabNode)
    {
        tabNode.querySelector(".data-header-fileName").innerHTML = "?";
        tabNode.querySelector(".data-header-version").innerHTML = "?";

        let listGroup = tabNode.querySelector(".list-group");
        let listItems = tab_tabContainer.querySelectorAll(".list-group-item");
        for(let item of listItems)
            listGroup.removeChild(item);
    }
};
