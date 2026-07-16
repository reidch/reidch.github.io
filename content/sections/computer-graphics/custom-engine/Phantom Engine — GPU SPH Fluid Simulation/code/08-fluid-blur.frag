#version 450 core

in vec2 uv;
layout(location = 0) out float filteredDepth;

uniform sampler2D inputDepth;
uniform vec2 texelSize;
uniform vec2 direction;
uniform float depthFalloff;

void main()
{
    float center = texture(inputDepth, uv).r;
    if (center <= 0.0)
    {
        filteredDepth = 0.0;
        return;
    }

    const int radius = 6;
    const float sigma = 3.0;

    float weightedDepth = 0.0;
    float weightSum = 0.0;

    for (int i = -radius; i <= radius; ++i)
    {
        vec2 sampleUv = uv + direction * texelSize * float(i);
        float sampleDepth = texture(inputDepth, sampleUv).r;
        if (sampleDepth <= 0.0)
        {
            continue;
        }

        float spatialWeight = exp(-0.5 * float(i * i) / (sigma * sigma));
        float rangeWeight = exp(-abs(sampleDepth - center) * depthFalloff);
        float weight = spatialWeight * rangeWeight;

        weightedDepth += sampleDepth * weight;
        weightSum += weight;
    }

    filteredDepth = weightSum > 1e-5 ? weightedDepth / weightSum : center;
}
