/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/
const fs = require('fs');

module.exports = class Binary_File_Loader
{
    constructor()
    {
        this.handler = {
            "Yaz0": require("yaz0-lib"),
            "U.8-": null
        };
    }

    isCompressed(pathOrBuffer)
    {
        let bufferIn;
        if(pathOrBuffer instanceof Buffer)
        {
            bufferIn = pathOrBuffer.slice(0, 4);
        }else{
            let f = fs.fopenSync(pathOrBuffer);
            fs.readSync(f, bufferIn, 0, 4);
        }

        let magic = bufferIn.toString("utf8");
        return this.handler.hasOwnProperty(magic);
    }

    getMagic(pathOrBuffer)
    {
        let magicBuff = this.buffer(pathOrBuffer, 0, 4);
        let magic = magicBuff.slice(0, 4).toString("utf8");

        if(this.handler[magic] != null)
        {
            let unpackedBuff = this.buffer(pathOrBuffer);
            return this.getMagic(unpackedBuff);
        }

        return magic;
    }

    buffer(pathOrBuffer, depth = 0, dataLength = -1)
    {
        if(depth > 10)
        {
            console.error("Binary_File_Loader: max. depth reached!");
            return null;
        }

        if(pathOrBuffer == "" || pathOrBuffer == null)
            return null;

        let bufferIn  = (pathOrBuffer instanceof Buffer) ? pathOrBuffer : fs.readFileSync(pathOrBuffer);
        let bufferOut = null;

        let magic = bufferIn.toString("utf8", 0, 4);

        if(this.handler.hasOwnProperty(magic))
        {
            if(this.handler[magic] == null)
            {
                console.error(`Binary_File_Loader: unhandled format 'maigc'!`);
                return null;
            }

            let handler = this.handler[magic];

            //console.time("buff_Yaz0");
            let newBuff = handler.decode(bufferIn, dataLength);
            //console.timeEnd("buff_Yaz0");

            bufferOut = this.buffer(newBuff, depth + 1);
        }else{
            bufferOut = bufferIn;
        }

        return bufferOut;
    }
};
