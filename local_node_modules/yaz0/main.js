/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

let yaz0 = require("./bindings.js");
const fs = require("fs");

let filePath = "M:/Documents/roms/wiiu/unpacked/TEST/unpacked/Enemy_Guardian_A.sbfres";
let buff = fs.readFileSync(filePath);

//let filePath = "M:/Documents/roms/wiiu/unpacked/TEST/Dungeon001/Model/DgnMrgPrt_Dungeon001.sbfres";
{
let buffers = [];
for(let i=0; i<5; ++i)
{
    console.log(buff);

    let buffOut = yaz0.decode(buff);

    console.log(buffOut);
    console.log(buffOut.length);

    buffers.push(buff);
}
}
let buffOut = yaz0.decode(buff);

/*
magic:"Yaz0"
size:17401344
*/
