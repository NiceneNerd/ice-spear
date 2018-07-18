#version 300 es
    
layout(location=0) in vec2 position;
layout(location=1) in vec3 color;
layout(location=2) in vec2 instPos;

layout(std140) uniform sceneUniforms {
    vec2 uPos;
    vec2 uScale;
};

uniform vec2 aspectRatio;

out vec3 vColor;
out vec3 vUV;

void main() 
{
    vColor = color;
    vUV = vec3(position + vec2(0.5), float(gl_InstanceID));
    vUV.y = 1.0 - vUV.y;

    vec2 glPos = (position + instPos + uPos) * uScale * aspectRatio;

    gl_Position = vec4(glPos, 0.0, 1.0);
}
