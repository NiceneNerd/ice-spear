/**
* @author Max Bebök
*/

const Binary_File_Parser = require.main.require('./lib/binary_file/structure_parser.js');

module.exports = class YAZ0
{
    constructor()
    {
        this.parser = null;
        this.header = null;
        this.maxSize = 100 * 1024 * 1024; // 100 MB

        this.bufferIn  = null;
        this.bufferOut = null;
        this.bufferOutPos = 0;

        this.chunks = new Buffer(3);
    }

    writeOut(valOrBuffer)
    {
        if(valOrBuffer instanceof Buffer)
        {
            valOrBuffer.copy(this.bufferOut, this.bufferOutPos);
            this.bufferOutPos += valOrBuffer.length;
        }else{
            this.bufferOut[this.bufferOutPos++] = valOrBuffer;
        }
    }

    parseBlock()
    {
        let header = this.parser.file.read("u8");

        for(let i=7; i>=0; --i)
        {
            if(this.bufferOutPos >= this.header.size)
                return false;

            let chunkType = (header >> i) & 1;
            if(chunkType == 1)
            {
                this.writeOut(this.parser.file.read("u8"));
            }else{

                let length = 0;

                this.chunks[0] = this.parser.file.read("u8");
                this.chunks[1] = this.parser.file.read("u8");

                let offset = (((this.chunks[0] & 0xF) << 8) | this.chunks[1]) + 1;

                if(((this.chunks[0] >> 4) & 0xF) == 0) // has 3 bytes
                {
                    this.chunks[2] = this.parser.file.read("u8");
                    length = this.chunks[2] + 0x12;
                }else{
                    length = ((this.chunks[0] >> 4) & 0xF) + 0x02;
                }

                for(let i=0; i<length; ++i)
                {
                    this.writeOut(this.bufferOut[this.bufferOutPos - offset]);
                }
            }
        }

        return true;
    }

    decode(pathOrBuffer)
    {
        this.parser = new Binary_File_Parser(pathOrBuffer);
        this.parser.file.setEndian("big");
        this.header = this.parser.parse(require("./header.json"));

        if(this.header.size > this.maxSize)
        {
            console.error("Yaz0: maximum file size: " + this.maxSize);
            return false;
        }

        this.bufferIn  = this.parser.file.buffer;
        this.bufferOut = new Buffer(this.header.size);

        while(this.parseBlock());

        return this.bufferOut;
    }
};
