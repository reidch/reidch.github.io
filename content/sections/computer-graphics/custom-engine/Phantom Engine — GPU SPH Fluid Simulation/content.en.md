# GPU SPH Fluid Simulation & Screen-Space Rendering

This is a real-time fluid simulation and rendering project built with OpenGL 4.5 and compute shaders. Smoothed Particle Hydrodynamics (SPH) is used to represent fluid motion, while neighbourhood construction, density, pressure, force evaluation and particle updates are executed primarily on the GPU.

In the current version, I retained the GPU SPH simulation pipeline and focused on upgrading the final presentation. Instead of showing the fluid only as points or isolated spheres, a multi-pass screen-space reconstruction combines the discrete particles into a continuous surface with reflection, refraction and volumetric attenuation.

## Current Scale

The uploaded version currently uses:

- A `64 × 64 × 64` spatial grid
- Four initial particles per grid cell
- `64³ × 4 = 1,048,576` particles
- A compute work-group size of 256
- A simulation time step of `0.003`

The particle count above is derived directly from the constants in the current source code.

## GPU SPH Pipeline

Each simulation update is divided into a sequence of GPU stages:

1. Determine the grid-cell ID of every particle
2. Count the particles assigned to each cell
3. Build prefix sums and cell offsets
4. Partition particle indices by cell
5. Evaluate density from local neighbours
6. Compute pressure from the equation of state
7. Evaluate pressure, viscosity, gravity and interactive collision forces
8. Update particle positions and velocities

The regular-grid partition limits neighbour searches to nearby cells instead of comparing every particle with every other particle, making million-particle simulation practical.

## Density, Pressure and Forces

The density pass accumulates neighbouring particle contributions through a smoothing kernel.

Pressure is derived from a Tait-like equation of state based on the ratio between the current and rest densities:

```text
P = stiffness × ((density / restDensity)^gamma − 1)
```

The force stage includes:

- Symmetric pressure forces
- Viscosity
- Gravity
- Container constraints
- Interaction with a movable control sphere

## Collision and Interaction

The fluid is constrained within a three-dimensional box. Under a constant-acceleration assumption, the integration shader solves particle-plane impact times and can process multiple impacts within a single time step, reducing boundary tunnelling.

A movable control sphere also interacts with nearby particles, allowing the user to push, separate and disturb the fluid.

## Screen-Space Fluid Rendering

The screen-space renderer is organised as a sequence of passes.

### 1. Scene Color and Depth

The non-fluid scene is first rendered into an HDR color texture and a 32-bit depth texture. These buffers provide the background, occlusion and refraction inputs used during final composition.

### 2. Particle Depth Reconstruction

Each SPH particle is rendered as a camera-facing point sprite. The Fragment Shader analytically reconstructs the front surface of a sphere from the point coordinates and writes:

- True sphere-surface depth
- Linear view-space depth
- `gl_FragDepth`

This provides correct depth relationships between particles and solid scene geometry.

### 3. Thickness Accumulation

A separate additive pass accumulates the view-ray chord length through every visible particle into a floating-point thickness texture. The result controls absorption, body color and refraction strength.

### 4. Bilateral Depth Smoothing

Raw particle depth contains visible dimples. Separable horizontal and vertical bilateral filtering smooths the reconstructed surface while preserving silhouettes and important depth discontinuities.

### 5. Normal Reconstruction and Composition

The final Fragment Shader reconstructs view-space positions and surface normals from the smoothed depth, then combines:

- Cubemap environment reflection
- Screen-space scene refraction
- Schlick Fresnel
- Beer–Lambert absorption
- In-scattering color
- A narrow specular highlight
- A restrained bright rim on thin regions

The result presents the discrete SPH samples as a continuous real-time fluid surface.

## Rendering-Mode Comparison

The application provides three runtime render modes:

- Screen-space continuous fluid
- Instanced particle spheres
- Particle points

Press `C` to cycle through the modes. This is useful both for debugging and for directly comparing the raw simulation data with the reconstructed fluid surface.

## Controls

- `C`: cycle screen-space fluid, instanced spheres and points
- `V`: toggle the skybox
- `W/A/S/D` and mouse: move the camera
- `J/L`, `H/Y`, `I/K`: move the control sphere along three axes

## Core Code

The code section below presents selected stages of the pipeline:

- Particle spatial partitioning
- SPH density evaluation
- Pressure calculation
- Pressure and viscosity forces
- Particle integration and continuous collision handling
- Analytic particle-surface depth
- Bilateral depth filtering
- Final fluid reflection, refraction and volumetric composition

## Project Significance

This project connects massively parallel GPU simulation with a modern real-time fluid-rendering pipeline. It explores not only how to move a large number of particles, but also how to reconstruct those samples into a readable, continuous and materially convincing fluid surface.
