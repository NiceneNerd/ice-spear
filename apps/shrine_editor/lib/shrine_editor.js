/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs    = require('fs-extra');
const path  = require('path');
const BYAML = require("byaml-lib");
const SARC  = require("sarc-lib");
const yaz0  = require("yaz0-lib");

const Binary_File_Loader = require("binary-file").Loader;
const BFRES_Parser       = requireGlobal('lib/bfres/parser.js');
const Shrine_Renderer    = require("./shrine_renderer.js");

const Actor_Handler = require("./actor/handler.js");
const Actor_Editor  = require("./actor_editor/editor.js");
const Actor_Loader  = require("./actor/loader.js");

module.exports = class Shrine_Editor
{
    /**
     * @param {Node} canvasNode 
     */
    constructor(canvasNode, stringTable = null)
    {
        this.THREE = THREE;
        this.shrineDir  = "";
        this.shrineName = "";

        this.stringTable  = stringTable;
        
        this.fileLoader = new Binary_File_Loader();
        this.shrineRenderer = new Shrine_Renderer(canvasNode);
        
        this.actorHandler = new Actor_Handler(this.shrineRenderer, this.stringTable);
        this.actorEditor  = new Actor_Editor(this.actorHandler);
        this.actorLoader  = new Actor_Loader(this.actorHandler);

        this.loader = null;
    }

    /**
     * Load a shrine and it's models, textures, actors and other stuff
     * @param {string} directory directory of the shrine
     * @param {string} name name of the shrine
     */
    async load(directory, name)
    {
        this.shrineDir = directory;
        this.shrineName = name;

        this.actorHandler.loader = this.loader;
        await this.actorHandler.loadActorDatabase();
        await this._loadShrineModel();

        if(this.loader)await this.loader.setStatus("Adding Actors to Scene");
        
        await this.actorLoader.load(this.shrineDir, this.shrineName);
    }

    /**
     * starts the editor and it's renderer
     */
    start()
    {
        this.shrineRenderer.start();
    }

    clear()
    {
        this.shrineRenderer.clear();
    }

    /**
     * loads the shrine BFRES model, also tries to load the texture file
     */
    async _loadShrineModel()
    {
        const shrineModelPath = path.join(this.shrineDir, "Model", "DgnMrgPrt_" + this.shrineName + ".sbfres");
        if(fs.existsSync(shrineModelPath))
        {
            const modelBuffer = this.fileLoader.buffer(shrineModelPath);

            this.shrineBfresParser = new BFRES_Parser(true);
            this.shrineBfresParser.loader = this.loader;

            if(await this._loadShrineTexture())
                this.shrineBfresParser.setTextureParser(this.texBfresParser);

            if(await this.shrineBfresParser.parse(modelBuffer))
            {
                const shrineModels = this.shrineBfresParser.getModels();
                Object.values(shrineModels).forEach(subModel => this.shrineRenderer.setShrineModels(subModel));

                return true;
            }
        }
        return false;
    }

    /**
     * tries to load the Tex2 texture file
     */
    async _loadShrineTexture()
    {
        const shrineTexPath = path.join(this.shrineDir, "Model", "DgnMrgPrt_" + this.shrineName + ".Tex2.sbfres");
        if(fs.existsSync(shrineTexPath))
        {
            const texBuffer = this.fileLoader.buffer(shrineTexPath);

            this.texBfresParser = new BFRES_Parser(true);
            this.texBfresParser.loader = this.loader;
            if(await this.texBfresParser.parse(texBuffer))
            {
                return true;
            }
        }

        return false;
    }

    async save()
    {
        const packPath = this.shrineDir.replace(".unpacked", "");

        await Promise.all([
            this.saveActors("Dynamic"),
            this.saveActors("Static"),
        ]);

        const sarc = new SARC();
        await sarc.fromDirectory(this.shrineDir);
        await sarc.save(packPath);
    }

    async saveActors(typeName)
    {
        const actorPath = path.join(this.shrineDir, "Map", "CDungeon", this.shrineName, `${this.shrineName}_${typeName}.smubin`); 
        const byaml = new BYAML.Creator();
        const actorBuffer = byaml.create(typeName == "Dynamic" ? this.actorHandler.dataActorDyn : this.actorHandler.dataActorStatic);
        const actorYaz = yaz0.encode(actorBuffer);

        await fs.writeFile(actorPath, actorYaz);
    }
}
