/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

/**
 * a BYAML value
 */
module.exports = class BYAML_Value
{
    constructor(type = null, value = null)
    {
        this.setValue(type, value);
    }

    setValue(type, value)
    {
        this.type  = type;
        this.value = value;
    }
};