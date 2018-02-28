/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

/**
 * continer class for storing string tables
 */
module.exports = class String_Table
{
    constructor()
    {
        this.data = new Map();
        this.indexArray = {};
        this.offset = 0;
        this.length = 0;

        this.sizeBytes = 0;
    }

    /**
     * adds an entry if it's not already added
     * @param {String} str 
     */
    add(str)
    {
        if(!this.data.has(str))
        {
            this.indexArray[str] = this.data.size;
            this.data.set(str, this.size());
            this.sizeBytes += str.length + 1;
        }
    }

    /**
     * returns an entry, same as Map.get
     * @param {String} str index
     */
    get(str)
    {
        return this.data.get(str);
    }

    /**
     * returns the size in bytes the table takes
     */
    size()
    {
        return this.sizeBytes;
    }

    /**
     * returns the number of elements
     */
    count()
    {
        return this.data.size;
    }

    /**
     * sorts the Map its keys
     */
    sort()
    {
        this.data = new Map([...this.data.entries()].sort());
        let offset = 0;
        let i=0;
        this.forEach((val, key, map) =>
        {
            map.set(key, offset);
            offset += key.length + 1;

            this.indexArray[key] = i++;
        });
    }

    getIndex(str)
    {
        return this.indexArray[str];
    }

    forEach(f)
    {
        this.data.forEach(f);
    }
};