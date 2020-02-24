const SARC = require("sarc-lib");
const yaz0 = require("yaz0-lib");
const fs = require("fs-extra");

const fieldDir = "/home/mbeboek/Documents/roms/wiiu/The Legend of Zelda Breath of the Wild [ALZP0101]/content/Terrain/A/MainField/";
const destDir = "/home/mbeboek/graphicPacks/BreathOfTheWild_EventTest/content/Terrain/A/MainField/";

let files = fs.readdirSync(fieldDir);
let filesGrass = files.filter(x => x.includes(".grass.extm.sstera"));
let filesHeight = files.filter(x => x.includes(".hght.sstera"));

const grassBuff = Buffer.alloc(64 * 64 * 4);
const heightBuff = Buffer.alloc(131072);

let i=0;
/*
for(name of filesGrass) 
{
    const nameParts = name.split(".");
    let id = parseInt(nameParts[0], 16);
    let fileNames = [
        (id + 0).toString(16).toUpperCase(),
        (id + 1).toString(16).toUpperCase(),
        (id + 2).toString(16).toUpperCase(),
        (id + 3).toString(16).toUpperCase(),
    ].map(x => x + '.grass.extm');

    const sarc = new SARC();
    fileNames.forEach(entry => 
    {
        sarc.addFile(entry, grassBuff);
    });
    const sarcBuff = sarc.create();
    fs.writeFileSync(destDir + name, yaz0.encode(sarcBuff));

    console.log(`${name} | ${i}/${filesGrass.length}`);
    ++i;
}
*/
i=0;
console.log(filesHeight);

for(name of filesHeight) 
{
    const nameParts = name.split(".");
    let id = parseInt(nameParts[0], 16);
    let fileNames = [
        (id + 0).toString(16).toUpperCase(),
        (id + 1).toString(16).toUpperCase(),
        (id + 2).toString(16).toUpperCase(),
        (id + 3).toString(16).toUpperCase(),
    ].map(x => x + '.hght');

    const sarc = new SARC();
    fileNames.forEach(entry => 
    {
        sarc.addFile(entry, heightBuff);
    });
    const sarcBuff = sarc.create();
    fs.writeFileSync(destDir + name, yaz0.encode(sarcBuff));

    console.log(`${name} | ${i}/${filesHeight.length}`);
    ++i;
}