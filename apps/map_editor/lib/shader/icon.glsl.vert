#version 300 es
    
layout(location=0) in vec2 position;
layout(location=1) in vec2 uv;
layout(location=2) in vec2 instPos;

layout(std140) uniform globalUniforms {
    vec2 uAspectRatio;
};

layout(std140) uniform cameraUniforms {
    vec2 uPos;
    vec2 uScale;
};

out vec4 vColor;
out vec2 vUV;

void main() 
{
    vColor = vec4(0.255, 0.631, 0.882, 1.0);
    vUV = uv;

    vec2 posScaled = position / uScale * 0.025;
    vec2 glPos = (posScaled + instPos + uPos) * uScale * uAspectRatio;

    gl_Position = vec4(glPos, 0.0, 1.0);
}
