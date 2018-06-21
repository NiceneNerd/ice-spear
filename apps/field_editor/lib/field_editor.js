/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const path = require("path");

const Mubin_Editor = require("./../../../lib/mubin_editor/editor");
const Field_Model_Loader = require("./field/model_loader");
const Field_Creator = require("./field/creator");

module.exports = class Field_Editor extends Mubin_Editor
{
    /**
     * @param {Node} canvasNode 
     * @param {Node} uiNode
     * @param {Project_Manager} project
     * @param {Loader} loader
     * @param {stringTable} stringTable optional string table object
     */
    constructor(canvasNode, uiNode, project, loader, stringTable = undefined)
    {
        super(canvasNode, uiNode, project, loader, stringTable = undefined);

        this.loadActorData = true;
        this.loadProdData  = true;

        this.fieldModelLoader = new Field_Model_Loader();
        this.fieldCreator = new Field_Creator(this.actorHandler, this.project);
    }

    /**
     * maps the actory type to the actual mubin location, this will differ between shrines and the main-field
     * @param {string} actorType 
     */
    generateMubinPath(actorType)
    {
        return path.join(this.mubinDir, `${this.mubinName}_${actorType}.smubin`);
    }

    /**
     * maps the prod type to the actual prod location, this will differ between shrines and the main-field
     * @param {string} prodNum
     * @returns {string|undefined} 
     */
    generateProdPath(prodNum)
    {
        const prodPrefixes = ["00", "01", "10", "11"];
        if(prodNum < prodPrefixes.length)
        {
            return path.join(this.mubinDir, `${this.mubinName}.${prodPrefixes[prodNum]}_Clustering.sblwp`);
        }
        return undefined;
    }

    /**
     * loads the map model (field or shrine)
     */
    async loadMapModel()
    {
        //this.shrineModelLoader.loader = this.loader;
        //const shrineModels = await this.shrineModelLoader.load(this.mubinDir, this.mubinName);
        //this.mubinRenderer.setMapModels(shrineModels);
    }

    /**
     * Load a shrine and it's models, textures, actors and other stuff
     * @param {string} directory directory of the shrine
     * @param {string} name name of the field
     */
    async load(directory, name)
    {
        await super.load(directory, name);
        
        // jump the camera to the mid-point
        const cam = this.getRenderer().camera;
        const midPos = this.calcMidPosition(name);

        cam.position.x = midPos.x;
        cam.position.y = midPos.y;
        cam.position.z = midPos.z;
    }

    /**
     * calculates the middle of the current section
     * @param {string} name 
     */
    calcMidPosition(name)
    {
        let [letter, num] = name.split("-");
        letter = letter.charCodeAt() - "A".charCodeAt();
        num = parseInt(num);

        return new this.THREE.Vector3(
            (letter - 4.5) * 1000,
            300,
            (num - 4.5) * 1000
        );
    }

    /**
     * returns the project field path
     * @returns {string}
     */
    getFieldFilePath()
    {
        return path.join(this.mubinDir, this.mubinName);
    }

    /**
     * saves all field related data
     * @param {bool} rebuild if true, it rebuilds the .pack file
     */
    async save()
    {
        return await this.fieldCreator.save(this.mubinDir, this.mubinName);
    }
}
