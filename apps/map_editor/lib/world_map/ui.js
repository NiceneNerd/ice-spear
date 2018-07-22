/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const QuerySelector_Cache = require("./../../../../lib/queryselector_chache");

module.exports = class World_Map_UI
{
    constructor(uiNode)
    {
        this.uiNode = uiNode;
        this.nodeSelector = new QuerySelector_Cache(this.uiNode);
    }

    _formatFloat(val)
    {
        return val.toFixed(4);
    }

    update(data)
    {
        this.updatePos(data.pos.x, data.pos.y);
        this.updateMarker(data.marker.x, data.marker.y);
        this.updateFieldSection(data.fieldSection);
        this.updateShrine(data.shrine);
    }

    updatePos(x, y)
    {
        this.nodeSelector.querySelector(".data-pos-x").innerHTML = this._formatFloat(x);
        this.nodeSelector.querySelector(".data-pos-y").innerHTML = this._formatFloat(y);
    }

    updateMarker(x, y)
    {
        this.nodeSelector.querySelector(".data-marker-x").innerHTML = this._formatFloat(x);
        this.nodeSelector.querySelector(".data-marker-y").innerHTML = this._formatFloat(y);
    }

    updateFieldSection(name)
    {
        this.nodeSelector.querySelector(".data-fieldSection").innerHTML = 
            `${name.x || '?'}-${name.y || '?'}`;
    }

    updateShrine(name)
    {
        this.nodeSelector.querySelector(".data-shrine").innerHTML = name;
    }
};