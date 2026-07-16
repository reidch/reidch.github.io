#version 450 core

in vec2 uv;
out vec4 FragColor;

uniform sampler2D sceneColor;
uniform sampler2D sceneDepth;
uniform sampler2D fluidDepth;
uniform sampler2D fluidThickness;
uniform samplerCube skybox;

uniform mat4 inverseProjection;
uniform mat4 inverseView;
uniform vec2 texelSize;

uniform vec3 absorption;
uniform vec3 scatteringColor;
uniform float refractionStrength;
uniform float roughness;

vec3 ReconstructViewPosition(vec2 coord, float linearDepth)
{
    vec4 farPoint = inverseProjection * vec4(coord * 2.0 - 1.0, 1.0, 1.0);
    vec3 ray = farPoint.xyz / farPoint.w;
    return ray * (linearDepth / max(-ray.z, 1e-5));
}

float ValidDepth(vec2 coord, float fallback)
{
    float d = texture(fluidDepth, coord).r;
    return d > 0.0 ? d : fallback;
}

float FresnelSchlick(float cosTheta, float f0)
{
    float m = clamp(1.0 - cosTheta, 0.0, 1.0);
    float m2 = m * m;
    return f0 + (1.0 - f0) * m2 * m2 * m;
}

float ReconstructSceneLinearDepth(vec2 coord)
{
    float deviceDepth = texture(sceneDepth, coord).r;
    if (deviceDepth >= 1.0)
    {
        return 1e20;
    }

    vec4 positionVS = inverseProjection * vec4(
        coord * 2.0 - 1.0,
        deviceDepth * 2.0 - 1.0,
        1.0
    );
    positionVS /= positionVS.w;
    return -positionVS.z;
}

void main()
{
    vec3 background = texture(sceneColor, uv).rgb;
    float depth = texture(fluidDepth, uv).r;

    if (depth <= 0.0)
    {
        FragColor = vec4(background, 1.0);
        return;
    }

    float leftDepth  = ValidDepth(uv - vec2(texelSize.x, 0.0), depth);
    float rightDepth = ValidDepth(uv + vec2(texelSize.x, 0.0), depth);
    float downDepth  = ValidDepth(uv - vec2(0.0, texelSize.y), depth);
    float upDepth    = ValidDepth(uv + vec2(0.0, texelSize.y), depth);

    vec3 centerVS = ReconstructViewPosition(uv, depth);
    vec3 leftVS   = ReconstructViewPosition(uv - vec2(texelSize.x, 0.0), leftDepth);
    vec3 rightVS  = ReconstructViewPosition(uv + vec2(texelSize.x, 0.0), rightDepth);
    vec3 downVS   = ReconstructViewPosition(uv - vec2(0.0, texelSize.y), downDepth);
    vec3 upVS     = ReconstructViewPosition(uv + vec2(0.0, texelSize.y), upDepth);

    vec3 dx = abs(leftDepth - depth) < abs(rightDepth - depth)
        ? centerVS - leftVS
        : rightVS - centerVS;
    vec3 dy = abs(downDepth - depth) < abs(upDepth - depth)
        ? centerVS - downVS
        : upVS - centerVS;

    vec3 normalVS = normalize(cross(dx, dy));
    if (normalVS.z < 0.0)
    {
        normalVS = -normalVS;
    }

    vec3 positionWS = (inverseView * vec4(centerVS, 1.0)).xyz;
    vec3 normalWS = normalize(mat3(inverseView) * normalVS);
    vec3 cameraWS = inverseView[3].xyz;
    vec3 viewWS = normalize(cameraWS - positionWS);

    float thickness = max(texture(fluidThickness, uv).r, 0.0);

    // Screen-space refraction of the already rendered scene.
    float depthScale = max(depth * 0.025, 1.0);
    vec2 refractedUv = clamp(
        uv + normalVS.xy * refractionStrength * (0.35 + thickness) / depthScale,
        texelSize,
        vec2(1.0) - texelSize
    );

    // Do not pull a foreground object across the water silhouette.
    if (ReconstructSceneLinearDepth(refractedUv) < depth)
    {
        refractedUv = uv;
    }
    vec3 refractedScene = texture(sceneColor, refractedUv).rgb;

    // Beer-Lambert attenuation plus a small in-scattering term gives water volume.
    vec3 transmittance = exp(-absorption * thickness);
    vec3 transmitted = refractedScene * transmittance
        + scatteringColor * (vec3(1.0) - transmittance);

    vec3 incidentWS = -viewWS;
    vec3 reflectedWS = reflect(incidentWS, normalWS);

    vec3 reflected = texture(skybox, reflectedWS).rgb;

    float fresnel = FresnelSchlick(max(dot(normalWS, viewWS), 0.0), 0.0204);
    vec3 color = mix(transmitted, reflected, fresnel);

    // Sun glint: deliberately narrow, so it reads as a wet surface rather than plastic.
    vec3 lightWS = normalize(vec3(0.35, 0.85, 0.25));
    vec3 halfVector = normalize(lightWS + viewWS);
    float specular = pow(max(dot(normalWS, halfVector), 0.0), mix(180.0, 70.0, roughness));
    color += vec3(1.0, 0.97, 0.90) * specular * 1.8;

    // Thin edges receive a restrained bright rim, which helps reveal splashes.
    float thinRim = (1.0 - smoothstep(0.10, 0.55, thickness)) * fresnel;
    color += vec3(0.75, 0.92, 1.0) * thinRim * 0.18;

    FragColor = vec4(color, 1.0);
}
