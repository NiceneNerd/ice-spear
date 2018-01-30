/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const fs    = require('fs');
const BYAML = requireGlobal("lib/byaml/byaml.js");

const Binary_File_Loader = requireGlobal('./lib/binary_file/file_loader.js');
const BFRES_Parser       = requireGlobal('./lib/bfres/parser.js');
const Shrine_Renderer    = require("./shrine_renderer.js");

module.exports = class Shrine_Editor
{
    /**
     * @param {Node} canvasNode 
     */
    constructor(canvasNode)
    {
        this.THREE = THREE;
        this.shrineDir  = "";
        this.shrineName = "";

        this.dataActorDyn = {};

        this.fileLoader = new Binary_File_Loader();
        this.renderer   = new Shrine_Renderer(canvasNode);
    }

    /**
     * Load a shrine and it's models, textures, actors and other stuff
     * @param {string} directory directory of the shrine
     * @param {string} name name of the shrine
     */
    load(directory, name)
    {
        this.shrineDir = directory;
        this.shrineName = name;

        this._loadShrineModel();
        this._loadDynamicActors();

        if(this.dataActorDyn != null && this.dataActorDyn.Objs != null)
        {
            for(let obj of this.dataActorDyn.Objs)
            {
                let name = obj.UnitConfigName;
                let pos = new this.THREE.Vector3(0.0, 0.0, 0.0);
                let rot = new this.THREE.Vector3(0.0, 0.0, 0.0);

                if(obj.Translate != null)
                    pos.fromArray(obj.Translate);

                if(obj.Rotate != null)
                {
                    if(obj.Rotate.length == null)
                        rot.x = obj.Rotate;
                    else
                        rot.fromArray(obj.Rotate);
                }
                    
                let actorObj = this.renderer.addActor({}, pos, rot);
                //console.log(actorObj);
            }
        }
    }

    /**
     * starts the editor and it's renderer
     */
    start()
    {
        this.renderer.start();
    }

    /**
     * loads the shrine BFRES model, also tries to load the texture file
     */
    _loadShrineModel()
    {
        let shrineModelPath = this.shrineDir + "Model/DgnMrgPrt_" + this.shrineName + ".sbfres";
        if(fs.existsSync(shrineModelPath))
        {
            let modelBuffer = this.fileLoader.buffer(shrineModelPath);

            this.shrineBfresParser = new BFRES_Parser(true);

            if(this._loadShrineTexture())
                this.shrineBfresParser.setTextureParser(this.texBfresParser);

            if(this.shrineBfresParser.parse(modelBuffer))
            {
                let shrineModels = this.shrineBfresParser.getModels();

                if(shrineModels[0] != null)
                        this.renderer.setShrineModels(shrineModels[0]);

                return true;
            }
        }
        return false;
    }

    /**
     * tries to load the Tex2 texture file
     */
    _loadShrineTexture()
    {
        let shrineTexPath = this.shrineDir + "Model/DgnMrgPrt_" + this.shrineName + ".Tex2.sbfres";
        console.log(shrineTexPath);
        if(fs.existsSync(shrineTexPath))
        {
            let texBuffer = this.fileLoader.buffer(shrineTexPath);

            this.texBfresParser = new BFRES_Parser(true);
            if(this.texBfresParser.parse(texBuffer))
            {
                return true;
            }
        }

        return false;
    }

    /**
     * loads dynamic actors from the BYAML file
     */
    _loadDynamicActors()
    {
        let fileActorsDyn = this.shrineDir + "Map/CDungeon/" + this.shrineName + "/" + this.shrineName + "_Dynamic.smubin";
        if(fs.existsSync(fileActorsDyn))
        {
            let byaml = new BYAML();
            this.dataActorDyn = byaml.parse(this.fileLoader.buffer(fileActorsDyn));
            return true;
        }
        return false;
    }
}
