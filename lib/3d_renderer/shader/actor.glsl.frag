#version 300 es
precision highp float;

out vec4 fragmentColor;

uniform sampler2D texColor;
uniform sampler2D texNormal;

in vec2 vUv;
in vec4 vColor;

void main()
{
    fragmentColor = texture(texColor, vUv);

    if(fragmentColor.a < 0.01)discard;

    fragmentColor *= vColor;

    //fragmentColor = vec4(1.0);
}