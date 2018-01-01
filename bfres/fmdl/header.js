/**
* @author Max Bebök
*
* special thanks to:
* http://mk8.tockdom.com/wiki/BFRES_(File_Format)
*/

module.exports = class FMDL_Header
{
    constructor()
    {
        // FILE DATA //
        this.magic   = "????";

        this.fileNameOffset = 0; // s32
        this.filePathOffset = 0; // s32

        this.fsklOffset = 0; // s32
        this.fvtxOffset = 0; // s32
        this.fshpOffset = 0; // s32
        this.fmatOffset = 0; // s32
        this.userDataOffset = 0; // s32

        this.fvtxCount = 0; // u16
        this.fshpCount = 0; // u16
        this.fmatCount = 0; // u16
        this.userDataCount = 0; // u16

        this.vertexCount = 0; // u32
        this.userPointer = 0; // u32

        // ADD. INFO READ FROM FILE //
        this.fileName = "?";
        this.filePath = "?";
    }
};
