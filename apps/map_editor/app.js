/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

const electron = require('electron');
const fs       = require('fs-extra');
const path     = require('path');
const url      = require('url');
const Notify   = requireGlobal("lib/notify/notify.js");
const App_Base = requireGlobal("./apps/base.js");

module.exports = class App extends App_Base
{
    constructor(window, args)
    {
        super(window, args);
    }

    async run()
    {
        await super.run();
console.log("wsf");


        const vertexShaderSource = 
        `#version 300 es
    
            layout(location=0) in vec4 position;
            layout(location=1) in vec3 color;
        
            out vec3 vColor;
            void main() {
                vColor = color;
                gl_Position = position;
            }`;

        const fragmentShaderSource = 
            `#version 300 es
            precision highp float;
        
            in vec3 vColor;
        
            out vec4 fragColor;
            void main() {
                fragColor = vec4(vColor, 1.0);
            }`;

        var PicoGL = require("picogl");
        var app = PicoGL.createApp(mapCanvas).clearColor(0.0, 0.0, 0.0, 1.0);

            // Create program from shader source.
        var program = app.createProgram(vertexShaderSource, fragmentShaderSource);

        var positions = app.createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
            -0.5, -0.5,
            0.5, -0.5,
            0.0, 0.5
       ]));
        
       var colors = app.createVertexBuffer(PicoGL.FLOAT, 3, new Float32Array([
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
       ]));

       var triangleArray = app.createVertexArray()
        .vertexAttributeBuffer(0, positions)
        .vertexAttributeBuffer(1, colors);

        var drawCall = app.createDrawCall(program, triangleArray);

        app.clear();
        drawCall.draw();
    }
};
