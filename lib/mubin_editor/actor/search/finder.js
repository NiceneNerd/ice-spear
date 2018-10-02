/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = class Actor_Search_Finder
{
    constructor(actorHandler, actorEditor)
    {
        this.actorHandler = actorHandler;
        this.actorEditor = actorEditor;
        
        this.result = [];
    }

    search(searchValue, filter)
    {
        searchValue = searchValue.toLowerCase();

        console.warn("SEARCH");
        console.log(filter);
        console.log(searchValue);

        this.result = [];
        for(const actorId in this.actorHandler.actors)
        {
            const actor = this.actorHandler.actors[actorId];

            if(this._checkActor(actor, searchValue, filter))
                this.result.push(actor);
        }
        return this.result;
    }

    _checkActor(actor, searchValue, filter)
    {
        const params = actor.params;

        if(!["Static", "Dynamic"].includes(actor.type))
            return false;

        if(!filter.static && actor.type == "Static")
            return false;

        if(!filter.dynamic && actor.type == "Dynamic")
            return false;

        if(filter.id && actor.getHashId() == searchValue) 
            return true;

        if(filter.srt && actor.getSRTHash() == searchValue) 
            return true;

        if(filter.name) 
        {
            const nameNorm = actor.getName().toLowerCase();
            if(nameNorm.includes(searchValue))
                return true;
        }

        if(filter.params) 
        {
            const paramStr = JSON.stringify(params).toLowerCase();
            if(paramStr.includes(searchValue))
                return true;
        }

        return false;
    }

    selectIndex(actorIndex)
    {
        actorIndex = parseInt(actorIndex);

        if(actorIndex >= 0 && actorIndex < this.result.length)
            this.actorEditor.selectActor(this.result[actorIndex]);
    }

    deselectIndex(actorIndex) 
    {
        actorIndex = parseInt(actorIndex);

        if(actorIndex >= 0 && actorIndex < this.result.length)
            this.actorEditor.deselectActor(this.result[actorIndex]);
    }

    selectAll()
    {
        for(let actor of this.result)
            this.actorEditor.selectActor(actor);
    }
};