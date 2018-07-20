#version 300 es
precision highp float;
precision highp sampler2DArray;

uniform sampler2DArray texColor;

in vec4 vColor;
in vec3 vUV;

out vec4 fragColor;

void main() 
{
    fragColor = texture(texColor, vUV) * vColor;
}
