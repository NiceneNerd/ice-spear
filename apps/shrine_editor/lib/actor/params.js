/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const BYAML = require("byaml-lib").Parser;

module.exports = class Actor_Params
{
    static parse(actor, {Translate = null, Rotate = null, ...params})
    {
        if(Translate != null)
            actor.pos.fromArray(BYAML.toRawValues(Translate));

        if(Rotate != null)
        {
            if(Rotate.length == null)
            {
                actor.rot.y = Rotate.value;
            }else{
                actor.rot.fromArray(BYAML.toRawValues(Rotate));
            }
        }

        return actor;
    }
}