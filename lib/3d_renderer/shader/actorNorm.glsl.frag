#version 300 es
precision highp float;

out vec4 fragmentColor;

uniform sampler2D texColor;
uniform sampler2D texNormal;

in vec2 vUv;
in vec4 vColor;
in vec3 vNormal;
in float blendFactor;

void main()
{
    fragmentColor = texture(texColor, vUv);

    if(fragmentColor.a < 0.5)discard;

    vec3 colorMulti = (clamp(gl_FragCoord.w * 100.0, 0.4, 1.0)) * vNormal;
    colorMulti = mix(vColor.xyz, colorMulti, 1.0 - blendFactor);

    fragmentColor *= vColor;
    fragmentColor.xyz *= colorMulti;
}