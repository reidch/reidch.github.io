# Phantom Engine — Feature Showcase

This project is not presented as a finished, complete engine. It is a staged showcase of several features currently integrated into my in-development custom graphics engine.

The current goal is to establish a foundational pipeline that connects asset management, scene and game-object descriptions, animation updates, material evaluation and final real-time rendering. The video demonstrates an asset repository, material import, scene definitions, game-object definitions, a hierarchical scene-object tree, skeletal animation, physically based rendering and real-time atmospheric scattering.

## Asset Repository

The engine uses an asset repository to manage models, textures, materials, animations and other reusable resources through a common interface.

The repository is responsible for:

- Storing and retrieving assets through stable identifiers
- Avoiding unnecessary duplicate loading
- Connecting scene data with the resources it references
- Providing unified access to models, materials, textures and animations
- Establishing a foundation for future caching, hot reloading and lifetime management

Scenes and game objects can therefore reference repository entries instead of directly owning low-level resource objects.

## Material Import

The engine reads material and texture information associated with imported models and converts it into its internal material representation.

The current import process handles:

- Base color and base-color textures
- Normal maps
- Metallic values
- Roughness values
- Material-to-submesh assignments
- Registration and referencing of texture assets through the asset repository

This connects external asset descriptions to the internal rendering pipeline, allowing imported models to retain meaningful surface properties rather than appearing only as untextured geometry.

## Scene Definition

Scenes are described through independent scene data instead of hard-coding every object directly into the rendering implementation.

A scene definition can describe:

- The game objects contained in the scene
- Cameras, lights and environment parameters
- Model, material and animation references
- Position, rotation and scale
- Parent-child relationships
- Rendering and animation components that should be enabled

This separates scene content from low-level systems and establishes a basis for future scene saving, loading, editing and serialization.

## Game-Object Definition

A game object is the basic organizational unit of the scene.

Each game object can contain:

- A name and stable identifier
- A local transform
- Model or mesh references
- Material references
- Animation state
- Parent and child relationships
- Additional rendering components or parameters

Game-object definitions bring logical identity, spatial transformation and rendering resources into one consistent structure instead of distributing them across unrelated code.

## Hierarchical Scene-Object Tree

Game objects are organized through parent-child relationships in a hierarchical scene-object tree.

A child's world transform is derived from both its own local transform and the world transform of its parent. Moving, rotating or scaling a parent therefore propagates naturally to its descendants.

The hierarchy supports:

- Recursive local-to-world transform updates
- Composite objects and complex scene structures
- Characters, equipment and attachment points
- Multi-part model organization
- A consistent representation of spatial relationships

## Skeletal Animation

The skeletal animation system reads bone hierarchies, animation keyframes and skinning data from animated models, then evaluates the final bone transformations at runtime.

The main process includes:

- Reading the bone hierarchy and skinning weights
- Interpolating position, rotation and scale keyframes
- Calculating local bone transformations
- Propagating transforms through the hierarchy
- Producing final skinning matrices
- Applying GPU skinning in the vertex shader

This allows animated characters to move continuously in real time without storing a separate mesh for every frame.

## Physically Based Rendering

The engine uses physically based material and lighting models to produce more consistent material behaviour under different lighting conditions.

The current system focuses on:

- Base color
- Metallic response
- Roughness
- Normal information
- View and light directions
- Specular and diffuse contributions
- Combining imported textures with material parameters

The PBR pipeline is connected to the material-import system so that external assets can enter the renderer with a more complete set of surface properties.

## Real-Time Atmospheric Scattering

The sky is not generated from a fixed sky texture. It is evaluated at runtime from the sun direction, viewing direction and atmospheric parameters.

To balance visual quality and computational efficiency, the implementation uses a **single-scattering approximation**. The Fragment Shader samples along the view ray, evaluates altitude-dependent Rayleigh and Mie densities, and accumulates the primary contribution of sunlight reaching the viewer after one scattering event.

The implementation includes:

- Rayleigh scattering
- Mie scattering
- A double-lobe Henyey–Greenstein phase function
- Atmospheric density falloff with altitude
- View-ray transmittance accumulation
- An optical air-mass approximation for sunlight extinction
- An analytic sun-disc approximation

It does not evaluate the full contribution of multiple scattering, so it is a real-time approximation rather than a complete physical atmosphere simulation.

## Sky Mode Switching

The application provides two sky modes:

- **Natural sky** — evaluated in real time with the single-scattering approximation
- **Purple sky** — a stylized variation for a more expressive atmosphere

Press `J` during runtime to switch instantly between the two modes.

This provides a direct comparison between physically motivated rendering and artistic control, demonstrating how the engine connects technical implementation with creative visual direction.

## Core Shader

The `atmospheric-scattering.frag` file displayed below contains the core Fragment Shader for atmospheric scattering.

It evaluates the Rayleigh and Mie phase functions, integrates the single-scattering contribution along the view direction, approximates sunlight extinction and view transmittance, adds an analytic sun disc and produces the final real-time sky color.

## Current Stage

This showcase represents a group of foundational features currently integrated into Phantom Engine, not the final form of the project.

Future work can continue with resource-lifetime management, scene serialization, a component system, editing tools, additional lighting, shadows, post-processing and other rendering systems.
