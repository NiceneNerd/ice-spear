uniform sampler2D tex00;
uniform sampler2D tex01;

in vec2 vUv;
in vec3 vPos;
flat in int texIndex;

void main(void)
{
    vec4 color00 = texture(tex00, vUv);
    vec4 color01 = texture(tex01, vUv);
    //c = Ca.rgb * Ca.a + Cb.rgb * Cb.a * (1.0 - Ca.a);

    //vec4 val = vec4(vPos, 1);
    
    vec4 val = color00;

    if(texIndex == 14)
        val = color01;

    fragmentColor= vec4(val.rgb, 1.0);
}