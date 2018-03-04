/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

/**
 * Handler for Project directories
 */
module.exports = class Project_Manager
{
    constructor(config)
    {
        this.config = config;
        this.path = null;
        this.name = "default";
    }

    /**
     * reopen the last used project
     * @param {Int} num optional index for the last used projects
     */
    reopenLast(num = 0)
    {
        let lastProjects = this.config.getValue("editor.lastOpened.projects");
        if(lastProjects[0] != null)
        {
            return this.open(lastProjects[0]);
        }

        return false;
    }

    /**
     * returns the cache directory of the current project
     */
    getCachePath()
    {
        return this.path + "/cache";
    }

    /**
     * opens a project directory
     * @param {String} path 
     */
    open(path)
    {
        this.path = path;
        return true;
    }
};