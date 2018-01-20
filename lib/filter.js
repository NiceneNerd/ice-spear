/**
* @author Max Bebök
*/
module.exports = class Filter
{
    constructor(inputSearch, nodeSearch, rowSelector = "tr", valueSelector = ".search-value")
    {
        this.inputSearch   = inputSearch;
        this.nodeSearch    = nodeSearch;
        this.rowSelector   = rowSelector;
        this.valueSelector = valueSelector;

        this._initEvents();
    }

    _initEvents()
    {
        var that = this;
        this.inputSearch.onkeyup = function(ev)
        {
            that.filter(this.value);
        };
    }

    filter(text)
    {
        text = text.toLowerCase();
        let items = this.nodeSearch.querySelectorAll(this.rowSelector);
        for(let item of items)
        {
            item.hidden = text != "";

            if(text == "")
                continue;

            let searchItems = item.querySelectorAll(this.valueSelector);
            for(let searchItem of searchItems)
            {
                if(searchItem.innerHTML.toLowerCase().includes(text))
                {
                    item.hidden = false;
                    break;
                }
            }
        }
    }
};
