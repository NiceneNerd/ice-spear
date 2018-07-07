#version 300 es
precision highp float;

out vec4 fragmentColor;

uniform sampler2D texColor;
uniform sampler2D texNormal;

in vec2 vUv;

void main()
{
    fragmentColor = texture(texColor, vUv);
    //fragmentColor = vec4(1.0);
}