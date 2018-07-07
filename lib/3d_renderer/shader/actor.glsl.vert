#version 300 es
precision highp float;

// mesh attributes
layout (location = 0) in vec3 position;
layout (location = 1) in vec2 uv;

// instanced attributes
layout (location = 2) in vec3 objPos;
layout (location = 3) in vec3 objRot;
layout (location = 4) in vec3 objScale;

// THREE.js uniforms
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

out vec2 vUv;

void main() 
{
    vUv = uv;

    vec3 vPosition = (position + objPos);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0 );
}