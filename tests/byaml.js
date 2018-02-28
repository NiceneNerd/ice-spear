var assert = require('assert');
global.requireGlobal = path => require("./../" + path);
global.__BASE_PATH = process.cwd() + "/";


const Config_Manager = require("./../lib/config_manager.js");
const Binary_File_Loader = require('./../lib/binary_file/file_loader.js');
const BYAML         = require("./../lib/byaml/byaml.js");
const BYAML_Creator = require("./../lib/byaml/byaml_creator.js");

let config = new Config_Manager();

function createAndCompare(fileInPath)
{
    let fileLoader = new Binary_File_Loader();
    let byamlInBuffer = fileLoader.buffer(fileInPath);

    let byamlJson = (new BYAML()).parse(byamlInBuffer);
    let byamlOutBuffer = (new BYAML_Creator()).create(byamlJson);

    return byamlInBuffer.compare(byamlOutBuffer) == 0;
}

describe('BYAML', function() 
{
    describe('parser & create', function() {
        it('recreate ActorInfo file', function()
        {
            this.timeout(1000 * 5);

            let byamlPath = config.getValue("game.path") + "/content/Actor/ActorInfo.product.sbyml";
            if(createAndCompare(byamlPath))
                return true;
        });
    });
});