/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const cytoscape = require("cytoscape");
const coseBilkent = require('cytoscape-cose-bilkent');
const Layout = require("./layout");

const CY_STYLE = require("./style.json");

module.exports = class Graph
{
    constructor()
    {
        cytoscape.use(coseBilkent);
        this.layout = new Layout();
    }

    _toggleChildren(node, originNode, hide)
    {
        const children = node.connectedEdges().targets();
        children.forEach((childNode, idx) => 
        {
            if(childNode != originNode) 
                this._toggleChildren(childNode, node, hide);
        }); 
        hide ? node.hide() : node.show();
    }

    build(objects, links)
    {
        const that = this;

        this.cy = cytoscape({
            container: cytoscapeContainer,
            boxSelectionEnabled: false,
            autounselectify: true,
            wheelSensitivity: 0.125,
            layout: {
                name: 'cose-bilkent',
                animate: "end",
                nodeDimensionsIncludeLabels: true,
                tilingPaddingVertical: 30,
                tilingPaddingHorizontal: 30,
                idealEdgeLength: 50,
                padding: 50
            },
            style: CY_STYLE,
            elements: {
                nodes: objects,
                edges: links
            }
        });

        this.cy.on('layoutstop', () => {
            const mainNodes = this.cy.nodes(".actor-name");
            mainNodes.forEach(mainNode => {
                this.layout.alignValueNodes(mainNode);
            });
        });

        this.cy.on('click', 'node', function(ev)
        {
            console.log(this);
            const children = this.connectedEdges().targets();
            children.forEach((childNode, idx) => 
            {
                if(childNode.hasClass("param-name"))
                {
                    that._toggleChildren(childNode, this, !childNode.hidden());
                }
            }); 
        });
    }
}