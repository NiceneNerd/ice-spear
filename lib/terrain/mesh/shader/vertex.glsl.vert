/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

in vec3 materialMap;

out vec2 vUv;
out vec3 vPos;

out float weight;
flat out vec2 texIndex;

void main()
{
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vPos = materialMap.rgb;

    texIndex = materialMap.rg;
    weight   = materialMap.b / 255.0;

    gl_Position = projectionMatrix * mvPosition;
}