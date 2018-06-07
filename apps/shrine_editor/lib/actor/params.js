/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const BYAML_Helper = require("byaml-lib").Helper;

module.exports = class Actor_Params
{
    static normalize(params)
    {
        // @TODO investigate more about Rotation (when is it an array, when not, is it always the Y-axis?)
        /*
        if(params.Rotate != null && params.Rotate.length == null)
        {
            params.Rotate = [
                BYAML_Helper.createValue("float32", 0.0),
                params.Rotate,
                BYAML_Helper.createValue("float32", 0.0)
            ];
        }
        */
    }
}