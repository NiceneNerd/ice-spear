/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/
const BFRES_FileTypes = require.main.require('./bfres/file_types.js');

module.exports = class GX2_Block_Handler
{
    constructor(buffer, size, format)
    {
        this.buffer = buffer;
        this.size   = size;
        this.format = format;

        let textureTypes = require.main.require("./bfres/gx2/texture_types.json");
        if(textureTypes[format] == null)
            throw `GX2: unknown texture format '${format}'!`;

        this.texTypeInfo = textureTypes[format];
        this.blockHandler = new (require(`./block_types/${this.texTypeInfo.handler}.js`));

        this.bytesPerPixel = (this.texTypeInfo.bpp / 8);
        this.bytesPerBlock = (this.texTypeInfo.bpBlock / 8);

        this.numBlocks = [
            this.size[0] / this.blockHandler.blockSize[0],
            this.size[1] / this.blockHandler.blockSize[1]
        ];
    }

    insertBlock(buffer, block, pos)
    {
        let offset = (pos[1] * this.blockHandler.blockSize[1] * this.size[0] * 4) + (pos[0] * this.blockHandler.blockSize[0] * 4);
        for(let y=0; y<this.blockHandler.blockSize[1]; ++y)
        {
            let blockOffset = y * this.blockHandler.blockSize[0] * 4;
            block.copy(buffer, offset, blockOffset, blockOffset + this.blockHandler.blockSize[0] * 4);
            //block.copy(buffer, offset, 0, 4 * 4);
            offset += this.size[0] * 4;
        }
    }

    decode()
    {
        let output = new Buffer.allocUnsafe(this.size[0] * this.size[1] * 4);
        for(let y=0; y<this.numBlocks[1]; ++y)
        {
            for(let x=0; x<this.numBlocks[0]; ++x)
            {
                let bufferOffset = (y * this.size[0] / this.bytesPerPixel) + (x * this.bytesPerBlock);

                //if(x == this.numBlocks[1] - 1)console.log(bufferOffset);

                let blockColor = this.blockHandler.decode(this.buffer.slice(bufferOffset, bufferOffset + this.bytesPerBlock), [x,y], this.size);

                this.insertBlock(output, blockColor, [x,y]);
            }
        }
        return output;
    }

    encode()
    {
        console.log("WIP");
    }
};
