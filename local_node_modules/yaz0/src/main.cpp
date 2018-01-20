/**
* C++ implementation of Yaz0
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

#include "../include/main_header.h"

void buffer_delete_callback(char* data, void* vector)
{
    delete reinterpret_cast<std::vector<u8> *> (vector);
}

NAN_METHOD(decode)
{
    auto bufferInObj = info[0]->ToObject();

    u8* bufferIn = (u8*)node::Buffer::Data(bufferInObj);
    auto bufferInSize = node::Buffer::Length(bufferInObj);

    std::vector<u8> *bufferOut = new std::vector<u8>();

    auto yaz0 = YAZ0(bufferOut);
    yaz0.decode(bufferIn, bufferInSize);

    info.GetReturnValue().Set(Nan::NewBuffer((char*)yaz0.getData(), yaz0.getSize(), buffer_delete_callback, bufferOut).ToLocalChecked());
}

NAN_MODULE_INIT(Initialize)
{
    NAN_EXPORT(target, decode);
}

NODE_MODULE(yaz0, Initialize);
