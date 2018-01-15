var yaz0;

if(process.env.DEBUG){
    yaz0= require('./build/Debug/yaz0.node')
}else{
    yaz0= require('./build/Release/yaz0.node')
}

module.exports = yaz0;
