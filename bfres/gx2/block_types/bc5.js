/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const GX2_BC4 = require("./bc4.js");

module.exports = class GX2_BC5
{
    constructor()
    {
        this.blockSize = [4, 4];
    }

    decode(blockBuffer, blockPos, imgSize)
    {
        let bc4 = new GX2_BC4();

        let colorsRed   = bc4.decode(blockBuffer.slice(0, 8), blockPos, imgSize);
        let colorsGreen = bc4.decode(blockBuffer.slice(8, 16), blockPos, imgSize);

        for(let i=0; i<colorsRed.length; i+=4)
        {
            colorsRed[i+1] = colorsGreen[i];
            colorsRed[i+2] = 0;
        }

        return colorsRed;
    }
};
