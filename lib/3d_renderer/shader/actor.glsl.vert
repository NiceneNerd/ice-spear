#version 300 es
precision highp float;

layout (location = 0) in vec3 position;
layout (location = 1) in vec2 uv;

layout (location = 2) in vec3 objPos;
layout (location = 3) in vec3 objRot;
layout (location = 4) in vec3 objScale;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
//uniform vec2 uv;

out vec2 vUv;

void main() 
{
    vec3 vPosition =  position + objPos;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0 );
}