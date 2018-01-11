/**
* @author Max Bebök
*
* convertet from python script:
* @see http://mk8.tockdom.com/wiki/GTX#Swizzling
*
* Original python Authors:
* @author AddrLib: actual code
* @author Exzap: modifying code to apply to Wii U textures
* @author AboodXD: porting, code improvements and cleaning up
*/

module.exports = class FTEX_Swizzler
{
    constructor()
    {
        this.BCn_formats = [0x31, 0x431, 0x32, 0x432, 0x33, 0x433, 0x34, 0x234, 0x35, 0x235];

        // If swizzling, set to True.
        // If deswizzling, set to False.
        this.do_swizzle = false;

        this.m_banks         = 4;
        this.m_banksBitcount = 2;
        this.m_pipes         = 2;
        this.m_pipesBitcount = 1;
        this.m_pipeInterleaveBytes = 256;
        this.m_pipeInterleaveBytesBitcount = 8;
        this.m_rowSize   = 2048;
        this.m_swapSize  = 256;
        this.m_splitSize = 2048;

        this.m_chipFamily    = 2;
        this.MicroTilePixels = 8 * 8;

        this.formatHwInfo =new Uint8Array(
           [0x00,0x00,0x00,0x01,0x08,0x03,0x00,0x01,0x08,0x01,0x00,0x01,0x00,0x00,0x00,0x01,
            0x00,0x00,0x00,0x01,0x10,0x07,0x00,0x00,0x10,0x03,0x00,0x01,0x10,0x03,0x00,0x01,
            0x10,0x0B,0x00,0x01,0x10,0x01,0x00,0x01,0x10,0x03,0x00,0x01,0x10,0x03,0x00,0x01,
            0x10,0x03,0x00,0x01,0x20,0x03,0x00,0x00,0x20,0x07,0x00,0x00,0x20,0x03,0x00,0x00,
            0x20,0x03,0x00,0x01,0x20,0x05,0x00,0x00,0x00,0x00,0x00,0x00,0x20,0x03,0x00,0x00,
            0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x01,0x20,0x03,0x00,0x01,0x00,0x00,0x00,0x01,
            0x00,0x00,0x00,0x01,0x20,0x0B,0x00,0x01,0x20,0x0B,0x00,0x01,0x20,0x0B,0x00,0x01,
            0x40,0x05,0x00,0x00,0x40,0x03,0x00,0x00,0x40,0x03,0x00,0x00,0x40,0x03,0x00,0x00,
            0x40,0x03,0x00,0x01,0x00,0x00,0x00,0x00,0x80,0x03,0x00,0x00,0x80,0x03,0x00,0x00,
            0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x10,0x01,0x00,0x00,
            0x10,0x01,0x00,0x00,0x20,0x01,0x00,0x00,0x20,0x01,0x00,0x00,0x20,0x01,0x00,0x00,
            0x00,0x01,0x00,0x01,0x00,0x01,0x00,0x00,0x00,0x01,0x00,0x00,0x60,0x01,0x00,0x00,
            0x60,0x01,0x00,0x00,0x40,0x01,0x00,0x01,0x80,0x01,0x00,0x01,0x80,0x01,0x00,0x01,
            0x40,0x01,0x00,0x01,0x80,0x01,0x00,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
            0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
            0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00]
        );
    }

    deswizzle(width, height, height2, format_, tileMode, swizzle_, pitch, bpp, data)
    {
        let result = new Uint8Array(data.length);

        if(this.BCn_formats.includes(format_))
        {
            width  = Math.floor((width + 3) / 4);
            height = Math.floor((height + 3)  / 4);
        }

        for(let y=0; y<height; ++y)
        {
            for(let x=0; x<width; ++x)
            {
                let pipeSwizzle = (swizzle_ >> 8) & 1;
                let bankSwizzle = (swizzle_ >> 9) & 3;

                let pos;
                if(tileMode == 0 || tileMode == 1)
                {
                    pos = this.AddrLib_computeSurfaceAddrFromCoordLinear(x, y, bpp, pitch);
                }else if(tileMode == 2 || tileMode == 3){
                    pos = this.AddrLib_computeSurfaceAddrFromCoordMicroTiled(x, y, bpp, pitch, tileMode);
                }else{

                    pos = this.AddrLib_computeSurfaceAddrFromCoordMacroTiled(x, y, bpp, pitch, height2, tileMode,pipeSwizzle, bankSwizzle);
                          //this.AddrLib_computeSurfaceAddrFromCoordMacroTiled(x, y, bpp, pitch, height, tileMode, pipeSwizzle,bankSwizzle);
                }

                let bpp2 = bpp;
                bpp2 = Math.floor(bpp2 / 8);

                let pos_ = (y * width + x) * bpp2;

                if((pos_ < data.length) && (pos < data.length))
                {
                    for(let p=0; p<bpp2; ++p)
                        result[pos_ + p] = data[pos + p];
                }
            }
        }

        return result;
    }

    surfaceGetBitsPerPixel(surfaceFormat)
    {
        let hwFormat = surfaceFormat & 0x3F;
        let bpp = this.formatHwInfo[hwFormat * 4 + 0];

        return bpp;
    }


    computeSurfaceThickness(tileMode)
    {
        let thickness = 1;

        if(tileMode == 3 || tileMode == 7 || tileMode == 11 || tileMode == 13 || tileMode == 15)
            thickness = 4;
        else if(tileMode == 16 || tileMode == 17)
            thickness = 8;

        return thickness;
    }

    computePixelIndexWithinMicroTile(x, y, bpp, tileMode, z=0)
    {
        let pixelBit6 = 0;
        let pixelBit7 = 0;
        let pixelBit8 = 0;
        let thickness = this.computeSurfaceThickness(tileMode);

        let pixelBit0 = x & 1;
        let pixelBit1 = (x & 2) >> 1;
        let pixelBit2 = y & 1;
        let pixelBit3 = (x & 4) >> 2;
        let pixelBit4 = (y & 2) >> 1;
        let pixelBit5 = (y & 4) >> 2;

        if(bpp == 0x08)
        {
            pixelBit0 = x & 1;
            pixelBit1 = (x & 2) >> 1;
            pixelBit2 = (x & 4) >> 2;
            pixelBit3 = (y & 2) >> 1;
            pixelBit4 = y & 1;
            pixelBit5 = (y & 4) >> 2;

        }else if(bpp == 0x10)
        {
            pixelBit0 = x & 1;
            pixelBit1 = (x & 2) >> 1;
            pixelBit2 = (x & 4) >> 2;
            pixelBit3 = y & 1;
            pixelBit4 = (y & 2) >> 1;
            pixelBit5 = (y & 4) >> 2;

        }else if(bpp == 0x20 || bpp == 0x60){
            pixelBit0 = x & 1;
            pixelBit1 = (x & 2) >> 1;
            pixelBit2 = y & 1;
            pixelBit3 = (x & 4) >> 2;
            pixelBit4 = (y & 2) >> 1;
            pixelBit5 = (y & 4) >> 2;

        }else if(bpp == 0x40){
            pixelBit0 = x & 1;
            pixelBit1 = y & 1;
            pixelBit2 = (x & 2) >> 1;
            pixelBit3 = (x & 4) >> 2;
            pixelBit4 = (y & 2) >> 1;
            pixelBit5 = (y & 4) >> 2;

        }else if(bpp == 0x80){
            pixelBit0 = y & 1;
            pixelBit1 = x & 1;
            pixelBit2 = (x & 2) >> 1;
            pixelBit3 = (x & 4) >> 2;
            pixelBit4 = (y & 2) >> 1;
            pixelBit5 = (y & 4) >> 2;
        }

        if(thickness > 1)
        {
            pixelBit6 = z & 1;
            pixelBit7 = (z & 2) >> 1;
        }

        if(thickness == 8)
            pixelBit8 = (z & 4) >> 2;

        return (
            (pixelBit8 << 8) | (pixelBit7 << 7) | (pixelBit6 << 6)
            | 32 * pixelBit5 | 16 * pixelBit4   | 8 * pixelBit3
            |  4 * pixelBit2 | pixelBit0        | 2 * pixelBit1
        );
    }

    computePipeFromCoordWoRotation(x, y)
    {
        // hardcoded to assume 2 pipes
        return ((y >> 3) ^ (x >> 3)) & 1;
    }

    computeBankFromCoordWoRotation(x, y)
    {
        let numPipes = this.m_pipes;
        let numBanks = this.m_banks;
        let bank = 0

        if(numBanks == 4)
        {
            let bankBit0 = ( Math.floor(y / (16 * numPipes)) ^ (x >> 3) ) & 1;
            bank = bankBit0 | 2 * (( Math.floor(y / (8 * numPipes)) ^ (x >> 4)) & 1);
        }
        else if(numBanks == 8)
        {
            let bankBit0a = ( Math.floor(y / (32 * numPipes)) ^ (x >> 3)) & 1;
            bank = (bankBit0a | 2 * (( Math.floor(y / (32 * numPipes)) ^ Math.floor(y / (16 * numPipes) ^ (x >> 4))) & 1) |
                4 * (( Math.floor(y / (8 * numPipes)) ^ (x >> 5)) & 1));
        }

        return bank;
    }

    isThickMacroTiled(tileMode)
    {
        let thickMacroTiled = 0;

        if(tileMode == 7 || tileMode == 11 || tileMode == 13 || tileMode == 15)
            thickMacroTiled = 1;

        return thickMacroTiled;
    }

    isBankSwappedTileMode(tileMode)
    {
        bankSwapped = 0;

        if(tileMode == 8 || tileMode == 9 || tileMode == 10 || tileMode == 11 || tileMode == 14 || tileMode == 15)
            bankSwapped = 1;

        return bankSwapped;
    }

    computeMacroTileAspectRatio(tileMode)
    {
        ratio = 1;

        if(tileMode == 8 || tileMode == 12 || tileMode == 14)
            ratio = 1;
        else if(tileMode == 5 || tileMode == 9)
            ratio = 2;
        else if(tileMode == 6 || tileMode == 10)
            ratio = 4;

        return ratio;
    }

    computeSurfaceBankSwappedWidth(tileMode, bpp, pitch, numSamples=1)
    {
        if(this.isBankSwappedTileMode(tileMode) == 0)
            return 0;

        let numBanks  = this.m_banks;
        let numPipes  = this.m_pipes;
        let swapSize  = this.m_swapSize;
        let rowSize   = this.m_rowSize;
        let splitSize = this.m_splitSize;
        let groupSize = this.m_pipeInterleaveBytes;
        let bytesPerSample = 8 * bpp;

        let samplesPerTile = Math.floor(splitSize / bytesPerSample);
        let slicesPerTile  = samplesPerTile == 0 ? 1 : Math.floor(Math.max(1, numSamples / samplesPerTile));

        if(this.isThickMacroTiled(tileMode) != 0)
            numSamples = 4;

        let bytesPerTileSlice = numSamples * Math.floor(bytesPerSample / slicesPerTile);

        let factor = this.computeMacroTileAspectRatio(tileMode);
        let swapTiles = Math.max(1, Math.floor((swapSize >> 1) / bpp));

        let swapWidth   = swapTiles * 8 * numBanks;
        let heightBytes = numSamples * factor * numPipes * Math.floor(bpp / slicesPerTile);
        let swapMax     = numPipes * numBanks * Math.floor(rowSize / heightBytes);
        let swapMin     = groupSize * 8 * Math.floor(numBanks / bytesPerTileSlice);

        let bankSwapWidth = Math.min(swapMax, Math.max(swapMin, swapWidth));

        while(!bankSwapWidth < (2 * pitch))
            bankSwapWidth >>= 1;

        return bankSwapWidth;
    }

    AddrLib_computeSurfaceAddrFromCoordLinear(x, y, bpp, pitch)
    {
        let rowOffset = y * pitch;
        let pixOffset = x;

        let addr = (rowOffset + pixOffset) * bpp;
        addr = Math.floor(addr / 8);

        return addr;
    }

    AddrLib_computeSurfaceAddrFromCoordMicroTiled(x, y, bpp, pitch, tileMode)
    {
        let microTileThickness = 1;

        if(tileMode == 3)
            microTileThickness = 4;

        let microTileBytes = Math.floor((this.MicroTilePixels * microTileThickness * bpp + 7) / 8);
        let microTilesPerRow = pitch >> 3;
        let microTileIndexX = x >> 3;
        let microTileIndexY = y >> 3;

        let microTileOffset = microTileBytes * (microTileIndexX + microTileIndexY * microTilesPerRow);

        let pixelIndex = this.computePixelIndexWithinMicroTile(x, y, bpp, tileMode);

        let pixelOffset = bpp * pixelIndex;
        pixelOffset >>= 3;

        return pixelOffset + microTileOffset;
    }

    AddrLib_computeSurfaceAddrFromCoordMacroTiled(x, y, bpp, pitch, height, tileMode, pipeSwizzle, bankSwizzle)
    {
        let numPipes = this.m_pipes;
        let numBanks = this.m_banks;
        let numGroupBits = this.m_pipeInterleaveBytesBitcount;
        let numPipeBits = this.m_pipesBitcount;
        let numBankBits = this.m_banksBitcount;

        let microTileThickness = this.computeSurfaceThickness(tileMode);

        let microTileBits = bpp * (microTileThickness * this.MicroTilePixels);
        let microTileBytes = Math.floor((microTileBits + 7) / 8);

        let pixelIndex  = this.computePixelIndexWithinMicroTile(x, y, bpp, tileMode);
        let pixelOffset = bpp * pixelIndex;
        let elemOffset  = pixelOffset;

        let bytesPerSample = microTileBytes;

        // FROM IF()
        let numSamples = 1;
        let sampleSlice = 0;

        if(microTileBytes <= this.m_splitSize)
        {
        }else{
            let samplesPerSlice = Math.floor(this.m_splitSize / bytesPerSample);
            let numSampleSplits = Math.max(1, Math.floor(1 / samplesPerSlice));
            numSamples = samplesPerSlice;
            sampleSlice = Math.floor(elemOffset / Math.floor(microTileBits / numSampleSplits));
            elemOffset %= Math.floor(microTileBits / numSampleSplits);
        }

        elemOffset += 7;
        elemOffset = Math.floor(elemOffset / 8);

        let pipe = this.computePipeFromCoordWoRotation(x, y);
        let bank = this.computeBankFromCoordWoRotation(x, y);

        let bankPipe = pipe + numPipes * bank;

        let swizzle_ = pipeSwizzle + numPipes * bankSwizzle;

        bankPipe ^= numPipes * sampleSlice * ((numBanks >> 1) + 1) ^ swizzle_;
        bankPipe %= numPipes * numBanks;
        pipe = bankPipe % numPipes;
        bank = Math.floor(bankPipe / numPipes);

        let sliceBytes = Math.floor((height * pitch * microTileThickness * bpp * numSamples + 7) / 8);
        let sliceOffset = sliceBytes * Math.floor(sampleSlice / microTileThickness);

        let macroTilePitch = 8 * this.m_banks;
        let macroTileHeight = 8 * this.m_pipes;

        if(tileMode == 5 || tileMode == 9) // GX2_TILE_MODE_2D_TILED_THIN4 and GX2_TILE_MODE_2B_TILED_THIN2
        {
            macroTilePitch >>= 1;
            macroTileHeight *= 2;
        }
        else if(tileMode == 6 || tileMode == 10) // GX2_TILE_MODE_2D_TILED_THIN4 and GX2_TILE_MODE_2B_TILED_THIN4
        {
            macroTilePitch >>= 2;
            macroTileHeight *= 4;
        }

        let macroTilesPerRow = Math.floor(pitch / macroTilePitch);
        let macroTileBytes = Math.floor((numSamples * microTileThickness * bpp * macroTileHeight * macroTilePitch + 7) / 8);
        let macroTileIndexX = Math.floor(x / macroTilePitch);
        let macroTileIndexY = Math.floor(y / macroTileHeight);
        let macroTileOffset = (macroTileIndexX + macroTilesPerRow * macroTileIndexY) * macroTileBytes;

        if(tileMode == 8 || tileMode == 9 || tileMode == 10 || tileMode == 11 || tileMode == 14 || tileMode == 15)
        {
            let bankSwapOrder = [0, 1, 3, 2, 6, 7, 5, 4, 0, 0];
            let bankSwapWidth = this.computeSurfaceBankSwappedWidth(tileMode, bpp, pitch);
            let swapIndex = macroTilePitch * Math.floor(macroTileIndexX / bankSwapWidth);
            bank ^= bankSwapOrder[swapIndex & (m_banks - 1)];
        }

        let groupMask = ((1 << numGroupBits) - 1);

        let numSwizzleBits = (numBankBits + numPipeBits);

        let totalOffset = (elemOffset + ((macroTileOffset + sliceOffset) >> numSwizzleBits));

        let offsetHigh = (totalOffset & ~groupMask) << numSwizzleBits;
        let offsetLow = groupMask & totalOffset;

        let pipeBits = pipe << numGroupBits;
        let bankBits = bank << (numPipeBits + numGroupBits);

        return bankBits | pipeBits | offsetLow | offsetHigh;
    }

};
