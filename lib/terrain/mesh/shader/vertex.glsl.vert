/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

in vec4 materialMap;

out vec2 vUv;
out vec3 vPos;

flat out int texIndex;

void main()
{
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vPos = materialMap.rgb;

    texIndex = int(materialMap.r);

    gl_Position = projectionMatrix * mvPosition;
}