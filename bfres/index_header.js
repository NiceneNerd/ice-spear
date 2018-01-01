/**
* @author Max Bebök
*
* special thanks to:
* http://mk8.tockdom.com/wiki/BFRES_(File_Format)
*/
module.exports = class BFRES_Index_Header
{
    constructor()
    {
        // DATA //
        this.length   = 0;
		this.entryNum = 0;

        // ADDITIONAL INFO //
        this.type = -1;
    }
};
