/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

module.exports = class Actor_Editor_History
{  
    /**
     * @param {Function} exportFunction sets the function that runs and returns the export
     * @param {Function} importFunction function to import a state again
     */
    constructor(exportFunction, importFunction)
    {
        this.exportFunction = exportFunction;
        this.importFunction = importFunction;

        this.history = [];
        this.historyPos = 0;
    }

    /**
     * @returns {Number} number of history entries
     */
    count()
    {
        return this.history.length;
    }

    /**
     * returns the current position in the history, normally the last index
     * @returns {Number} index
     */
    getPosition()
    {
        return this.historyPos;
    }

    /**
     * sets the current history pos, limits are checked
     * @param {Number} pos 
     */
    setPosition(pos)
    {
        if(pos >= 0 && pos < this.count())
            this.historyPos = pos;
    }

    /**
     * adds a new entry to the history
     */
    add()
    {
        const newEntry = this.exportFunction();

        if(newEntry) {
            this.drop();
            this.history.push(newEntry);    
            this.historyPos = this.history.length - 1;
        }
    }

    /**
     * goes back one entry and restores its state
     */
    undo()
    {
        if(this.historyPos > 0)
        {
            --this.historyPos;
            this.restore();
        }
    }

    /**
     * restores the state at the current position
     * by calling the provided import callback
     */
    restore()
    {
        if(this.historyPos >= 0 && this.history[this.historyPos])
        {
            this.importFunction(this.history[this.historyPos]);
        }
    }

    /**
     * drops all history positions after the current one
     */
    drop()
    {
        if(this.historyPos >= 0)    
            this.history.splice(this.historyPos + 1);
    }
};
