/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/
class YAZ0
{
    private:
        u32 MAX_FILE_SIZE = 256 * 1024 * 1024; // 256 MB

        u8* bufferIn    = nullptr;
        u32 bufferInPos = 0;

        std::vector<u8> *bufferOut = nullptr;
        u32 bufferOutSize = 0;
        u32 bufferOutPos  = 0;

        u8 flags[8];
        u8 chunks[3];

        bool writeOut(u8 val);
        u8 readIn();

        bool parseBlock();

    public:
        YAZ0(std::vector<u8> *bufferOut);

        bool decode(u8* buffer, u32 bufferSize);

        u8* getData();
        u32 getSize();

};
