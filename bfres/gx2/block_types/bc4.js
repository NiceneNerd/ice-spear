/*
* @author Max Bebök
*/

module.exports = class GX2_BC4
{
    constructor()
    {
        this.blockSize = [4, 4];
    }

    getcolorIndex(blockBuffer)
    {
        let colors = new Array(8);

        colors[0] = blockBuffer[0];
        colors[1] = blockBuffer[1];

        if(colors[0] > colors[1])
        {
            // 6 interpolated color values
            colors[2] = (6*colors[0] + 1*colors[1]) / 7.0;
            colors[3] = (5*colors[0] + 2*colors[1]) / 7.0;
            colors[4] = (4*colors[0] + 3*colors[1]) / 7.0;
            colors[5] = (3*colors[0] + 4*colors[1]) / 7.0;
            colors[6] = (2*colors[0] + 5*colors[1]) / 7.0;
            colors[7] = (1*colors[0] + 6*colors[1]) / 7.0;
        }else{
            // 4 interpolated color values
            colors[2] = (4*colors[0] + 1*colors[1]) / 5.0;
            colors[3] = (3*colors[0] + 2*colors[1]) / 5.0;
            colors[4] = (2*colors[0] + 3*colors[1]) / 5.0;
            colors[5] = (1*colors[0] + 4*colors[1]) / 5.0;
            colors[6] = 0.0;
            colors[7] = 255.0;
        }

        return colors;
    }

    decode(blockBuffer, blockPos, imgSize)
    {
        let colorBuffer = Buffer.allocUnsafe(this.blockSize[0] * this.blockSize[1] * 4);
        let colorBufferIndex = 0;
        let colors = this.getcolorIndex(blockBuffer);

        let indexBytes = new Uint32Array([
            (blockBuffer[4] << 16) | (blockBuffer[3] << 8) | (blockBuffer[2]),
            (blockBuffer[7] << 16) | (blockBuffer[6] << 8) | (blockBuffer[5])
        ]);

        let colorIndex = [];
        for(let colByte of indexBytes)
        {
            for(let ct=0; ct<8; ++ct)
            {
                let col = (colByte >> (3 * ct)) & 0b111;
                colorIndex.push(colors[col]);

                colorBuffer[colorBufferIndex++] = colors[col];
                colorBuffer[colorBufferIndex++] = colors[col];
                colorBuffer[colorBufferIndex++] = colors[col];
                colorBuffer[colorBufferIndex++] = 255.0;
            }
        }

        return colorBuffer;
    }
};
