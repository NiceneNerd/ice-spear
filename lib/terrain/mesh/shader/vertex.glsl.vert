in vec4 material;

out vec2 vUv;
out vec3 vPos;

flat out int texIndex;

void main()
{
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vPos = mvPosition.xyz;

    vPos = material.rgb;
    texIndex = int(material.r);

    gl_Position = projectionMatrix * mvPosition;
}