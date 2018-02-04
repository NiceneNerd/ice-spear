/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*
* Special Thanks to:
* @see https://github.com/Relys/rpl2elf
*/

const Config_Manager = requireGlobal("./lib/config_manager.js");
const pakoZlib = require('pako');
const RPX      = requireGlobal("lib/rpx/rpx.js");
const fs       = require("fs");
const crc32    = require('crc32');

/**
 * Handler for the global String table (with CRC32 hashes)
 */
module.exports = class String_Table
{
    constructor()
    {
        this.EXEC_PATH = "code/U-King.rpx";

        this.config = new Config_Manager();
        this.textDecoder = new TextDecoder("utf8");
        this.stringRegex = /^[a-zA-Z0-9\? \+*\/\\_\-:\[\]]+$/; // 44'123.303955078125ms

        this.cachePathString = this.config.getValue("cache.path") + "/string_table_hash2str.json";
        this.cachePathHash   = this.config.getValue("cache.path") + "/string_table_str2hash.json";

        this.tableString = {};
        this.tableHash   = {};

        this.loaded = false;
    }

    /**
     * Tries to load the string tables from the cache files
     * @returns bool true if cache files where loaded, false if they are missing
     */
    _loadFromCache()
    {
        //return false;
        if(fs.existsSync(this.cachePathString) && fs.existsSync(this.cachePathHash))
        {
            this.tableString = require(this.cachePathString);
            this.tableHash   = require(this.cachePathHash);
            return true;
        }

        return false;
    }

    /**
     * Saves the internal string tables to the cache files
     */
    _saveToCache()
    {
        fs.writeFile(this.cachePathString, JSON.stringify(this.tableString, null, 4), () => {
            console.log("String Table cache saved. (%s)", this.cachePathString);
        });

        fs.writeFile(this.cachePathHash,   JSON.stringify(this.tableHash,   null, 4), () => {
            console.log("String Table cache saved. (%s)", this.cachePathHash);
        });
    }

    /**
     * Loads the string sections from the main executable 
     * and generates a JSON file with names and hashes
     */
    async load()
    {
        if(this.loaded)
            return;

        console.time("RPX");

        if(this._loadFromCache())
        {
            console.log("String_Table: loaded from cache");
            console.timeEnd("RPX");
            this.loaded = true;
            return;
        }

        if(this.loader)await this.loader.setStatus("Generating String-Table");
        if(this.loader)await this.loader.setInfo("Parsing RPX File");

        let rpxFile = this.config.getValue("game.path") + "/" + this.EXEC_PATH;
        let rpx = new RPX();
        rpx.parse(rpxFile);
        console.timeEnd("RPX");

        console.time("RPX-Section");
        let strTables = rpx.getSectionData();
        console.timeEnd("RPX-Section");

        if(this.loader)await this.loader.setInfo(`Scanning Strings (this may take a minute)`);

        console.time("String-Scan");
        let i=0;
        for(let textBuff of strTables)
        {
            let offsetStart = 0;
            let offsetEnd   = offsetStart;

            while((offsetEnd = textBuff.indexOf(0, offsetStart)) >= 0)
            {
                if((offsetEnd - offsetStart) > 0)
                {
                    let str = this.textDecoder.decode(textBuff.slice(offsetStart, offsetEnd));

                    let strParts = str.split("\n");
                    for(let strPart of strParts)
                    {
                        if(this.stringRegex.test(str.toLowerCase()))
                            this._addEntry(str);
                    }
                }

                offsetStart = offsetEnd + 1;
            }
            ++i;
        }
        console.timeEnd("String-Scan");

        this._saveToCache();
        this.loaded = true;
    }

    /**
     * adds entries to the internal objects
     * @param {String} str 
     */
    _addEntry(str)
    {
        let hash = crc32(str).padStart(8, "0");

        this.tableString[hash] = str;
        this.tableHash[str]    = hash;
    }

    /**
     * get a string by a hash value
     * @param {String} hash
     */
    getString(hash)
    {
        return this.tableString[hash];
    }

    /**
     * get a hash value by a string
     * @param {String} str
     */
    getHash(str)
    {
        return this.tableHash[str];
    }
};