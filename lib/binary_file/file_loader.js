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
            "__Yaz0": require.main.require("./lib/yaz0/yaz0.js"),
            "Yaz0": require.main.require("yaz0-js"),
            "U.8-": null
        };
    }

    buffer(pathOrBuffer, depth = 0)
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

        console.log(magic);
        if(this.handler.hasOwnProperty(magic))
        {
            if(this.handler[magic] == null)
            {
                console.error(`Binary_File_Loader: unhandled format 'maigc'!`);
                return null;
            }

            let handler = this.handler[magic];

            console.time("buff_Yaz0");
            let newBuff = handler.decode(bufferIn);
            console.timeEnd("buff_Yaz0");

            bufferOut = this.buffer(newBuff, depth + 1);
        }else{
            bufferOut = bufferIn;
        }

        return bufferOut;
    }
};
