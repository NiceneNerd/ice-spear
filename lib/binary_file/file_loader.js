/**
* @author Max Bebök
*/

const fs = require('fs');

module.exports = class Binary_File_Loader
{
    constructor()
    {
        this.handler = {
            "Yaz0": require.main.require("./lib/yaz0/yaz0.js"),
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

            let handler = new this.handler[magic];

            console.time("buff_Yaz0");
            let newBuff = handler.parse(bufferIn);
            console.timeEnd("buff_Yaz0");

            bufferOut = this.buffer(newBuff, depth + 1);
        }else{
            bufferOut = bufferIn;
        }

        return bufferOut;
    }
};
