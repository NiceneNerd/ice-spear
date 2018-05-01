/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require("fs-extra");
const path = require("path");
var sanitizeFilename = require("sanitize-filename");

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
     * creates an empty project inside a given directory
     * @param {string} projectPath 
     */
    async create(name)
    {
        const projectPath = path.join(this.config.getValue("projects.path"), sanitizeFilename(name));

        await Promise.all([
            fs.ensureDir(path.join(projectPath, "cache")),
            fs.ensureDir(path.join(projectPath, "shrines"))
        ]);

        const templateJsonFile = await fs.readFile(path.join(__dirname, "config-template.json"));
        const templateJson = JSON.parse(templateJsonFile);

        templateJson.name = name;
        
        await fs.writeFile(path.join(projectPath, "project.ice.json"), JSON.stringify(templateJson, null, 4));
    }

    open(name)
    {
        return this.openPath(path.join(this.config.getValue("projects.path"), name));
    }

    openCurrent()
    {
        const currentPath = localStorage.getItem("current-project");      
        if(currentPath) {
            return this.openPath(currentPath);
        }
        return false;
    }

    /**
     * reopen the last used project
     * @param {Int} num optional index for the last used projects
     */
    reopenLast(num = 0)
    {
        let lastProjects = this.config.getValue("projects.lastOpened");
        if(lastProjects[0] != null)
        {
            return this.openPath(lastProjects[0]);
        }

        return false;
    }

    async listProjectNames()
    {
        const projectPath = this.config.getValue("projects.path");
        const projectNames = [];
        const files = await fs.readdir(projectPath);

        for(const file of files)
        {
            const fullPath = path.join(projectPath, file);
            const fsStat = await fs.stat(fullPath);
            if(fsStat.isDirectory() && await fs.exists(path.join(fullPath, "project.ice.json")))
            {
                projectNames.push(file);
            }
        }
        
        return projectNames.sort((a,b) => {
            a = a.toLowerCase();
            b = b.toLowerCase();
            return a == b ? 0 : (a < b ? -1 : 1);
        });
    }

    /**
     * returns the cache directory of the current project
     */
    getCachePath()
    {
        return path.join(this.path, "cache");
    }

    /**
     * opens a project directory
     * @param {String} path 
     */
    openPath(path)
    {
        this.path = path;
        console.log("Project opened: " + this.path);
        
        localStorage.setItem("current-project", this.path)
        this.config.pushValue("projects.lastOpened", this.path, true);
        this.config.save();

        return true;
    }
};