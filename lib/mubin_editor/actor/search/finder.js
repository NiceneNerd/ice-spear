/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = class Actor_Search_Finder
{
    constructor(actorHandler)
    {
        this.actorHandler = actorHandler;
        console.log(this.actorHandler);
    }

    search(searchValue, filter)
    {
        console.warn("SEARCH");
        console.log(filter);
        console.log(searchValue);

        const result = [];
        for(const actorId in this.actorHandler.actors)
        {
            const actor = this.actorHandler.actors[actorId];
            const params = actor.params;

            if(params.UnitConfigName && params.UnitConfigName.value) {
                const nameNorm = params.UnitConfigName.value.toLowerCase();
                if(nameNorm.includes(searchValue)) {
                    result.push(actor);
                    //console.log(actor);
                }
            }
        }
        return result;
    }

    selectAll()
    {
        console.log("select all");
    }
};