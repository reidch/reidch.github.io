#version 450 core

in vec3 centerVS;

uniform mat4 projection;
uniform float particleRadius;

layout(location = 0) out float linearViewDepth;

void main()
{
    vec2 disk = gl_PointCoord * 2.0 - 1.0;
    float radius2 = dot(disk, disk);
    if (radius2 > 1.0)
    {
        discard;
    }

    float frontOffset = sqrt(max(1.0 - radius2, 0.0)) * particleRadius;
    vec3 surfaceVS = centerVS + vec3(disk * particleRadius, frontOffset);

    vec4 clip = projection * vec4(surfaceVS, 1.0);
    gl_FragDepth = clip.z / clip.w * 0.5 + 0.5;
    linearViewDepth = -surfaceVS.z;
}
