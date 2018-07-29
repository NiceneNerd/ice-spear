/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const App_Base = requireGlobal("./apps/base.js");
const JSON_IPC = require("./../../lib/json_ipc/json_ipc");

module.exports = class App extends App_Base
{
    constructor(window, args)
    {
        super(window, args);

        this.actorIdMap = {};
    }

    _idToHex(id)
    {
        return id.toString("16").toUpperCase().padStart(8, "0");
    }

    _createIdMap(actors, type)
    {
        for(const actor of actors)
        {
            const id = this._idToHex(actor.HashId.value);
            actor._type = type;

            if(id === undefined)
            {
                console.warn("Actor has no ID:");
                console.log(actor);
                continue;
            }
            
            if(this.actorIdMap[id])
            {
                console.warn("Actor-ID already in use: ", id);
            }

            this.actorIdMap[id] = actor;
        }
    }

    _buildGraph(objects, links)
    {
        const cytoscape = require("cytoscape");
        const coseBilkent = require('cytoscape-cose-bilkent');
        const nodeHtmlLabel = require('cytoscape-node-html-label');

        cytoscape.use(coseBilkent);
        nodeHtmlLabel(cytoscape);

        const style = require("./lib/style.json");
        this.cy = cytoscape({
            container: cytoscapeContainer,
            boxSelectionEnabled: false,
            autounselectify: true,
            wheelSensitivity: 0.125,
            layout: {
                //name: 'dagre',
                name: 'cose-bilkent',
                animate: "end",
                nodeDimensionsIncludeLabels: true,
                tilingPaddingVertical: 30,
                tilingPaddingHorizontal: 30,
                idealEdgeLength: 50,
                padding: 50
            },
            style,
            elements: {
                nodes: objects,
                edges: links
            }
        });

        this.cy.nodeHtmlLabel([{
            query: '.labelActor',
            valign: "center",
            halign: "center",
            valignBox: "center",
            halignBox: "center",
            tpl: function(data) {
                return `<p>${data.labelName}</p><p>${data.labelId}</p>`;
            }
        }]);
    }

    async load(data)
    {
        console.log(data);
        const fs = require("fs-extra");

        //const actorsDyn    = await fs.readJSON("C:/Users/Max/.ice-spear-projects/test/actorDynamic.json");
        //const actorsStatic = await fs.readJSON("C:/Users/Max/.ice-spear-projects/test/actorStatic.json");
        const actorsDyn = data.actorsDyn.Objs;
        const actorsStatic = data.actorsStatic.Objs;

        this._createIdMap(actorsDyn, "Dynamic");
        this._createIdMap(actorsStatic, "Static");

        const links = [];
        const objects = [];

        const colorDefault = "#d8b05f";
        const colorLink = "#2d7dc4";
        const colorEvent = "#1f9b2b";

        let posX = 0.0;
        let posY = 0.0;
        for(const id in this.actorIdMap)
        {
            const actor = this.actorIdMap[id];
            const actorName = actor.UnitConfigName.value;

            let actorColor = colorDefault;

            if(actorName.startsWith("LinkTag"))
                actorColor = colorLink;

            if(actorName.startsWith("Event"))
                actorColor = colorEvent;

            objects.push({
                "data": {
                    id: id,
                    labelId: id,
                    labelName: actorName + "\n" + id,
                    bgColor: actorColor
                },
                "group": "nodes",
                "selectable": true,
                "grabbable": true,
                "classes": "actor-name"
            });

            if(actor["!Parameters"])
            {
                for(let paramName in actor["!Parameters"])
                {
                    if(["SharpWeaponJudgeType", "DropTable"].includes(paramName))
                        continue;

                    const param = actor["!Parameters"][paramName];
                    const val = (param.value === undefined) ? "<complex>" : param.value;
                    //console.log(`Param ${paramName} = ${val}`);

                    const paramNameId  = `${id}-${paramName}-name`;
                    const paramValueId = `${id}-${paramName}-value`;

                    objects.push({
                        data: {
                            id: paramNameId,
                            labelName: paramName
                        },
                        group: "nodes",
                        selectable: true,
                        grabbable: true,
                        classes: "param-name"
                    });

                    objects.push({
                        data: {
                            id: paramValueId,
                            labelValue: val
                        },
                        group: "nodes",
                        selectable: true,
                        grabbable: true,
                        classes: "param-value"
                    });

                    links.push({
                        "data": {
                          id: `link-${id}:${paramNameId}`,
                          source: id,
                          target: paramNameId,
                        },
                        "group": "edges",
                        "selectable": true,
                        "grabbable": true,
                        "classes": "param-edge"
                    });

                    links.push({
                        "data": {
                          id: `link-${paramNameId}:${paramValueId}`,
                          source: paramNameId,
                          target: paramValueId,
                          labelName: param.type,
                        },
                        "group": "edges",
                        "selectable": true,
                        "grabbable": true,
                        "classes": "param-edge"
                    });
                }
            }   

            if(actor.LinksToObj)
            {
                if(!actor.LinksToObj.length)
                    console.warn("actor.LinksToObj is not an array!");

                for(const ref of actor.LinksToObj)
                {
                    const destName = ref.DefinitionName.value;
                    const destId   = this._idToHex(ref.DestUnitHashId.value);
                    if(!this.actorIdMap[destId])
                    {
                        console.warn(`Link: ${id} -> ${destId} (${destName}), destination does not exist!`);
                        continue;
                    }

                    links.push({
                        "data": {
                          id: `link-${id}:${destId}`,
                          source: id,
                          target: destId,
                          labelName: destName,
                          color: actorColor
                        },
                        "group": "edges",
                        "selectable": true,
                        "grabbable": true,
                      });

                    //console.log(`Link: ${id} -> ${destId} (${destName})`);
                }
            }
        }

        this._buildGraph(objects, links);
    }

    async run()
    {
        await super.run();

        this.mapName = this.args.mapName;
        document.title = "Ice-Spear - Logic Editor - " + this.mapName;

        //this.load();

        this.jsonIpc = new JSON_IPC("logic-editor-" + this.mapName);
        await this.jsonIpc.createServer((name, type, data) => {
            if(type == "actor-data")
            {
                this.load(data);
            }
        });        

        this.jsonIpc.send("shrine-editor-Dungeon002", "logic-editor-ready", {a:7});
    }
};

