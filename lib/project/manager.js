/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const Config_Manager = require("./../config/manager.js");
var sanitizeFilename = require("sanitize-filename");

const PROJECT_CONFIG_NAME = "project.ice.json";

/**
 * Handler for Project directories
 */
module.exports = class Project_Manager
{
    constructor(mainConfig)
    {
        this.mainConfig = mainConfig;
        this.projectConfig = new Config_Manager();
        this.path = null;
        this.name = "default";
    }

    /**
     * creates an empty project inside a given directory
     * @param {string} projectPath 
     */
    async create(name)
    {
        const projectPath = path.join(this.mainConfig.getValue("projects.path"), sanitizeFilename(name));

        await Promise.all([
            fs.ensureDir(path.join(projectPath, "cache")),
            fs.ensureDir(path.join(projectPath, "shrines"))
        ]);

        const config = new Config_Manager();
        config.load(path.join(__dirname, "config-template.json"));

        config.setValue("name", name);
        config.setValue("ice-spear.version", process.env.npm_package_version);

        config.save(path.join(projectPath, PROJECT_CONFIG_NAME));
    }

    async open(name)
    {
        return await this.openPath(path.join(this.mainConfig.getValue("projects.path"), name));
    }

    /**
     * opens a project directory
     * @param {String} path 
     */
    async openPath(projectPath)
    {
        if(!await this.isValidProjectPath(projectPath))
            return false;

        this.projectConfig.load(path.join(projectPath, PROJECT_CONFIG_NAME));

        this.path = projectPath;
        console.log("Project opened: " + this.path);

        localStorage.setItem("current-project", this.path)
        this.mainConfig.pushValue("projects.lastOpened", this.path, true);
        this.mainConfig.save();

        return true;
    }

    async save()
    {
        this.projectConfig.setValue("ice-spear.version", process.env.npm_package_version);
        this.projectConfig.save();
    }

    async openCurrent()
    {
        const currentPath = localStorage.getItem("current-project");      
        if(currentPath) {
            return await this.openPath(currentPath);
        }
        return false;
    }

    /**
     * reopen the last used project
     * @param {Int} num optional index for the last used projects
     */
    async reopenLast(num = 0)
    {
        let lastProjects = this.mainConfig.getValue("projects.lastOpened");
        if(lastProjects[0] != null)
        {
            return await this.openPath(lastProjects[0]);
        }

        return false;
    }

    async listProjectNames()
    {
        const projectPath = this.mainConfig.getValue("projects.path");
        const projectNames = [];
        const files = await fs.readdir(projectPath);

        for(const file of files)
        {
            const fullPath = path.join(projectPath, file);

            if(await this.isValidProjectPath(fullPath))
                projectNames.push(file);
        }
        
        return projectNames.sort((a,b) => {
            a = a.toLowerCase();
            b = b.toLowerCase();
            return a == b ? 0 : (a < b ? -1 : 1);
        });
    }

    async isValidProjectPath(projectPath)
    {
        if(!await fs.exists(projectPath))
            return false;

        const fsStat = await fs.stat(projectPath);
        return (
            fsStat.isDirectory() && 
            await fs.exists(path.join(projectPath, PROJECT_CONFIG_NAME))
        );
    }

    getName()
    {
        return this.name;
    }

    /**
     * returns the cache directory of the current project
     */
    getCachePath()
    {
        return this.path ? path.join(this.path, "cache") : os.tmpdir();
    }

    /**
     * returns the path to put extracted shrines in
     */
    getShrinesPath()
    {
        return this.path ? path.join(this.path, "shrines") : os.tmpdir();
    }
};