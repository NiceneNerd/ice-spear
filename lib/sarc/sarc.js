/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require('fs');
const Binary_File_Parser = requireGlobal('./lib/binary_file/structure_parser.js');

module.exports = class SARC
{
    constructor()
    {
    }

    parse(pathOrBuffer)
    {
        this.parser = new Binary_File_Parser(pathOrBuffer);
        this.header = this.parser.parse(require("./header.json"));

        console.log(this.header);
    }
};
