#version 450 core

in vec3 centerVS;

uniform mat4 projection;
uniform float particleRadius;

layout(location = 0) out float thickness;

void main()
{
    vec2 disk = gl_PointCoord * 2.0 - 1.0;
    float radius2 = dot(disk, disk);
    if (radius2 > 1.0)
    {
        discard;
    }

    float halfChord = sqrt(max(1.0 - radius2, 0.0)) * particleRadius;
    vec3 frontVS = centerVS + vec3(disk * particleRadius, halfChord);

    vec4 clip = projection * vec4(frontVS, 1.0);
    gl_FragDepth = clip.z / clip.w * 0.5 + 0.5;

    // Optical scale compensates for overlapping SPH kernels.
    thickness = (2.0 * halfChord) * 0.03;
}
