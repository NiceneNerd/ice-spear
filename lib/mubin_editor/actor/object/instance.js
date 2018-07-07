/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = class Actor_Object_Instance
{
    constructor(handler)
    {
        this.handler = handler;
    }

    updateMatrix(pos, rot, scale)
    {
        console.warn("@TODO: Actor_Object_Instance:updateMatrix()");
        console.log({pos, rot, scale});
    }

    setColor(color)
    {
       console.warn("@TODO: Actor_Object_Instance:setColor()");
    }
};
