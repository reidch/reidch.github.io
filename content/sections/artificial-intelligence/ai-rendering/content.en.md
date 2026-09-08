# Geometry-First 3D Scene Generation

This project presents a **fully automated, geometry-first framework for controllable indoor 3D scene generation**. The goal is not merely to create plausible individual images. A persistent virtual environment must also preserve layout, hierarchy, camera geometry, object identity and metric structure strongly enough to remain coherent when viewed from new positions.

The central idea is:

> **Spatial facts that are already known explicitly should remain authoritative instead of being repeatedly re-inferred by generative models.**

Explicit geometry therefore acts as a persistent spatial contract across asset generation, scene assembly, camera planning, multi-view synthesis and final reconstruction.

## Declarative Scene Control

A structured Scene JSON is the single scene-specific control interface. It defines:

- Object and room hierarchy
- Position, rotation and scale
- Approximate scaffold geometry
- Explicit generation modes
- Stable semantic / owner identity
- Object-level and scene-level appearance controls

The description is compiled into a common scene state. Generic processing routes are selected by generation mode rather than by hard-coded semantic categories, allowing different object inventories, layouts and styles to pass through the same software.

## Geometry as Persistent Authority

Scaffold geometry provides approximate shape, scale and placement. Generative components are allowed to enrich local detail and appearance, but the scaffold remains responsible for the object's spatial role.

For generated 3D assets, the pipeline:

1. Selects representative views from the scaffold
2. Renders RGB, mask and depth conditions
3. Generates a visually enriched representative image
4. Converts the image into a detailed 3D asset
5. Registers the generated asset back to the scaffold in model space
6. Reintegrates it through the original scene hierarchy

Bounded retries and automatic fallbacks keep a failed asset from blocking the entire scene.

## Architectural Surface Generation

Walls, floors and ceilings already have complete geometry, so only their appearance needs to be synthesised.

The system generates them in rectified surface space while preserving their physical proportions, then commits the result back to the exact triangle parameterisation. Geometry continues to determine where the surface is and how large it is; the generative model determines how it looks.

## Automatic Camera Planning

After scene assembly, the same explicit geometry drives observation planning.

The camera system considers:

- The physically valid region bounded by room surfaces
- Collision bodies derived from object scaffolds
- Area-weighted room-shell coverage
- Duplicate observations
- Physical surfaces jointly visible between cameras

Candidate cameras are corrected against walls and objects, and additional views are added to fill remaining coverage holes. Cameras are then connected into a graph according to shared visible surface area.

## Geometry-Aligned Multi-View Generation

Each accepted camera exports aligned:

- RGB
- Metric depth
- Owner / semantic identity
- Diagnostic geometry buffers

Final views are not generated independently.

Generation traverses the camera graph from trusted observations. Previously generated neighbours are reprojected into the current target using known cameras and metric depth, filtered using visibility and owner identity, and robustly fused into a target-aligned appearance condition.

The generator therefore receives both target geometry and appearance evidence expressed in the **target coordinate frame**, together with a scene-level appearance prompt.

## Reliability and Repair

Progressive generation creates an unavoidable asymmetry: early views have fewer trusted neighbours.

The system therefore separates *completion* from *reference trust*. Structural validation decides whether an output is reliable enough to influence later cameras.

After the first traversal, one bounded post-hoc repair sweep revisits early views using the stronger scene-level appearance consensus that has become available later in the process.

## Persistent 3D Representation

The final RGB images, exact cameras and metric depths are exported to a depth-supervised 3D Gaussian Splatting backend.

The output is therefore not simply a collection of generated images, but a persistent representation that supports novel-view rendering.

The complete pipeline can be summarised as:

**Scene JSON → Scaffold Geometry → Generated Assets & Surfaces → Camera Graph → Geometry-Aligned Multi-View Generation → Validation & Repair → Depth-Supervised 3DGS**

## Controllability

Spatial layout and visual appearance are controlled independently.

Hierarchy, transforms and scaffolds determine spatial organisation, while object, surface and scene prompts determine appearance.

A matched Rococo / Modern pair uses the same base layout and evaluation cameras while producing substantially different visual styles. A third anime-inspired scene uses a different layout and object inventory while passing through the same generic stages.

This demonstrates both:

- Restyling while preserving layout
- Processing a new layout without adding scene-specific code

## Evaluation

The framework was evaluated on three complete indoor scenes.

Across **72 training views**, the final 3DGS achieved:

- PSNR: **33.55 ± 2.01 dB**
- SSIM: **0.9634 ± 0.0080**
- LPIPS: **0.0382 ± 0.0116**

Across **108 frozen novel views**:

- Metric depth MAE: **0.0748 ± 0.0595 m**
- Median depth MAE: **0.0678 m**

Across **72 adjacent-view pairs**:

- Reprojection MAE: **0.0210 ± 0.0137 m**
- Reprojection AbsRel: **0.00648 ± 0.00425**

Published-method values shown on the full project page are treated as contextual references rather than a controlled ranking because the evaluated scenes and camera trajectories differ.

## Ablation Studies

Four ablations isolate the role of the main coordination mechanisms.

With **independent per-view generation**, training PSNR on one test scene fell from **33.61 dB** to **27.80 dB**, while LPIPS increased from **0.0378** to **0.1144**.

When a strong neighbouring image was used **without target-space reprojection**, strict acceptance across 18 matched targets fell from **18/18** to **10/18**, while validated generation attempts increased from **21** to **124**. The reference image leaked its own viewpoint and composition into the target.

Removing the **post-hoc repair sweep** leaves some early views structurally valid but less harmonised because they were generated before enough trusted appearance evidence existed.

Replacing direct geometry-based collision exit with **fixed 5 cm local stepping** can produce severely occluded cameras in tight configurations, showing the value of using known collision geometry directly.

## Engineering Design

The project also treats recoverability as part of the pipeline design.

It uses:

- Explicit stage artifacts
- Scoped cache keys
- Persistent generation workers
- Bounded retries
- Automatic fallbacks
- Separate completion and trust states
- Resumable execution

A failed asset or difficult view therefore does not require restarting the complete scene.

## Current Scope

The current evaluation focuses on **static, single-room indoor scenes** and assumes approximate geometry for elements that require spatial authority.

The system is therefore best suited to settings where a user, procedural tool or upstream planner already knows the intended spatial arrangement and wants generative components to enrich it visually.

Thin geometry, close-range views, detailed decoration and weakly observed regions remain more difficult, while image generation, image-to-3D synthesis and multi-view refinement remain computationally expensive.

## Why This Project Matters

The main contribution is not another isolated generative model. It is a **coordination layer** around heterogeneous pretrained generation and reconstruction components.

The same explicit spatial facts remain available whenever downstream stages need them, allowing generative models to enrich the world without repeatedly redefining its structure.
