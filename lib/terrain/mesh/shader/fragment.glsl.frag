/**
* @copyright 2018 - Max Bebök
* @author Max Bebök
* @license GNU-GPLv3 - see the "LICENSE" file in the root directory
*/

uniform sampler2D tex00;
uniform sampler2D tex01;
uniform sampler2D tex02;
uniform sampler2D tex03;
uniform sampler2D tex04;
uniform sampler2D tex05;
uniform sampler2D tex06;
uniform sampler2D tex07;
uniform sampler2D tex08;
uniform sampler2D tex09;
uniform sampler2D tex10;
uniform sampler2D tex11;

in vec2 vUv;
in vec3 vPos;
flat in int texIndex;

void main(void)
{
    //c = Ca.rgb * Ca.a + Cb.rgb * Cb.a * (1.0 - Ca.a);

    //vec4 val = vec4(vPos, 1);
    
    vec4 val = vec4(1.0);

    switch(texIndex)
    {
        case 0: val = texture(tex00, vUv); break;
        case 1: val = texture(tex01, vUv); break;
        case 2: val = texture(tex02, vUv); break;
        case 3: val = texture(tex03, vUv); break;
        case 4: val = texture(tex04, vUv); break;
        case 5: val = texture(tex05, vUv); break;
        case 6: val = texture(tex06, vUv); break;
        case 7: val = texture(tex07, vUv); break;
        case 8: val = texture(tex08, vUv); break;
        case 9: val = texture(tex09, vUv); break;
        case 10: val = texture(tex10, vUv); break;
        case 11: val = texture(tex11, vUv); break;

        default:
            val.r = float(texIndex) / 5.0;
            val.g = 0.0;
            val.b = 0.0;
        break;
    }

    fragmentColor= vec4(val.rgb, 1.0);
}