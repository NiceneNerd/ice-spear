/**
* @author Max Bebök
*
* special thanks to:
* http://mk8.tockdom.com/wiki/BFRES_(File_Format)
*/

module.exports = class BFRES_Header
{
    constructor()
    {
        // CONSTANTS //
        this.FILE_TABLE_SIZE = 12;
        this.FILE_POS_OFFSET = 0x20;

        // FILE DATA //
        this.magic   = "????";
		this.version = new Array(4);
		this.bom     = new Array(2);

		this.headerLength   = 0;
		this.fileLength     = 0;
		this.fileAlignment  = 0;
		this.fileNameOffset = 0;

		this.stringTableLength = 0;
		this.stringTableOffset = 0;

		this.fileOffsets = new Array(this.FILE_TABLE_SIZE);
		this.fileCounts  = new Array(this.FILE_TABLE_SIZE);
		this.userPointer = 0;

        // ADD. INFO READ FROM FILE //
        this.fileName = "?";
    }
};
