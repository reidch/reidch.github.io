#version 450 core
#define PI 3.14159265

in vec3 position;
in vec3 sunDir;
out vec4 fragColor;

layout(std140, binding = 0) uniform cameraData{
    mat4 view;
    mat4 proj;
    mat4 viewProj;
    vec3 cameraPos;
};

layout(std140, binding = 4) uniform atomosphereData{
    vec3 sunlightColor;
    float thickness;
    float density;
    float sunSize;
    float steps;
    float intensity;
};

// Single-lobe HG
float HGPhase(float cosTheta, float g)
{
    float denom = 1.0 + g*g - 2.0*g*cosTheta;
    return (1.0 - g*g) / (4.0 * PI * pow(max(denom, 1e-3), 1.5));
}

// Double-lobe HG
float DHGPhase(float cosTheta, float g0, float g1, float f)
{
    float p0 = HGPhase(cosTheta, g0); // forward
    float p1 = HGPhase(cosTheta, g1); // backward
    return mix(p0, p1, f);
}

float RayleighPhase(float cosTheta){
    return 3.0 / (16.0 * PI) * (1 + cosTheta * cosTheta);
}

void main(){
    vec3 viewDir = normalize(position);
    float cosTheta = dot(viewDir, sunDir);
    float theta = acos(cosTheta);
    float stepSize = thickness / steps;

    // Rayleigh scattering
    vec3 betaR = vec3(5.8e-6, 1.35e-5, 3.1e-5);
    // Mie scattering
    vec3 betaM = vec3(2e-6, 2e-6, 2e-6);

    // Mie scattering coefficient
    float g0 = 0.85;   // strong forward scattering
    float g1 = -0.2;   // weak backward scattering
    float f  = 0.3;    // mix ratio

    // phase function
    float miePhase = DHGPhase(cosTheta, g0, g1, f);
    float rayleighPhase = RayleighPhase(cosTheta);

    vec3 scattering = vec3(0.0);
    vec3 transmittance = vec3(1.0);

    // The decay of sunlight during the way to Earth.
    // To collect light slightly below the horizon, a small disturbance
    // is added to the sun direction because the gradient around white light
    // is visually indistinguishable.
    float muS = clamp(
        dot(normalize(sunDir + vec3(0, 0.3, 0)), vec3(0, 1, 0)),
        0.0,
        1.0
    );

    float thetaDeg = acos(muS) * (180.0 / PI);
    float airMassS =
        1.0 / (muS + 0.50572 * pow(96.07995 - thetaDeg, -1.6364));

    vec3 extinctionS =
        exp(-(betaR + betaM) * airMassS * density);

    for (int s = 0; s < steps; s++){
        float t = (s + 0.5) * stepSize;
        vec3 samplePos = viewDir * t;

        float height = max(samplePos.y, 0.0);
        float localDensityM = exp(-height / 1200.0) * density;
        float localDensityR = exp(-height / 8000.0) * density;

        vec3 dL =
            (
                localDensityM * miePhase * betaM
                + localDensityR * rayleighPhase * betaR
            )
            * extinctionS
            * stepSize
            * transmittance;

        scattering += dL;

        transmittance *=
            exp(
                -(
                    localDensityM * betaM
                    + localDensityR * betaR
                )
                * stepSize
            );
    }

    // Sun disk
    float sunDisk = exp(-pow(theta / sunSize, 3));
    vec3 sunCol = extinctionS * sunDisk * sunlightColor;

    // Blend the color of the sun and scattered light
    vec3 color = scattering * sunlightColor + sunCol;
    fragColor = vec4(color * intensity, 1.0);
}
