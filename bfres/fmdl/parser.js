/**
* @author Max Bebök
*/

module.exports = class FMDL_Parser
{
    constructor(bfresFileParser)
    {
        this.parser = bfresFileParser;
        this.header = null;
    }

    async parseHeader()
    {
        this.header = this.parser.parse(require("./header.json"));
        console.log(this.header);
    }

    async parse()
    {
        try{
            this.parseHeader();

        } catch (err) {
            console.log(`FMDL::parse Exception: ${err}`);
        }
    }
};
