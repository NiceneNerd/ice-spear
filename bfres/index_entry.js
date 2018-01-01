/**
* @author Max Bebök
*
* special thanks to:
* http://mk8.tockdom.com/wiki/BFRES_(File_Format)
*/
module.exports = class BFRES_Index_Entry
{
    constructor(type)
    {
        this.searchValue = 0; // u32
		this.leftIndex   = 0; // u16
		this.rightIndex  = 0; // u16
		this.namePointer = 0; // s32
		this.dataPointer = 0; // s32

        this.type = type;
        this.parser = null;
    }
};
