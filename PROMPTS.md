# 3D Model Prompts

For AI 3D generators — Meshy, Tripo3D, Rodin/Hyper3D, Luma Genie. Different rules from image
prompts: **describe the object only.** No lighting, no camera, no mood, no aspect ratio. Those
are scene properties, and a 3D model has no scene — lighting gets added later in the browser.
Including them makes the output worse, not better.

---

## 1. The DATC module — the one that must be made

### Best path: image-to-3D, not text-to-3D

Crop the **"PRODUCT FOCUS"** panel from `ChatGPT Moodboard Aug 16 2026.png` — the isolated
module render, top right. Upload that as an image-to-3D input. Every one of these tools produces
dramatically better geometry from a reference image than from words, and this object already
exists as a clean product render on a plain background, which is the ideal input.

Use the text prompt below as the accompanying description.

### Text prompt

```
A compact electronic hardware module shaped like a flat rounded square puck. Wide square
footprint, low profile, approximately 155 x 120 x 60 mm proportions. Generously rounded corners
with a large fillet radius. A single straight diagonal seam line runs across the entire top face
from one corner toward the opposite side, splitting the top surface into two panels. Crisp
chamfered bevel around the top edge where the top face meets the side walls. Flat vertical side
walls. One small circular indicator light recessed into the centre of the front side wall.
Matte dark graphite anodised aluminium body, uniform finish, no visible screws, no ports, no
buttons, no branding text. Clean industrial product design, precise mechanical edges, symmetrical.
```

### Settings, not prompt

- **Output format:** `.glb`
- **Topology:** quad, if the tool offers it
- **Polygon count:** 20k–60k triangles — plenty for this shape
- **PBR materials:** on. Metalness and roughness maps are what make anodised aluminium read as
  metal rather than grey plastic
- **Texture resolution:** 2K is enough

### Known weakness

AI 3D generators are poor at crisp mechanical edges and terrible at embossed lettering. Expect
the chamfer to come out soft and do **not** ask for the `DATC` deboss in the prompt — it will
render as mush. Leave the body blank; the wordmark gets added later as a texture decal, which
looks sharper anyway.

If the chamfer comes out rounded and vague after two or three attempts, that is the tool's
ceiling. This object is a rounded box with one seam — a beginner can model it cleanly in Blender
in well under an hour, and it will beat any generated version.

---

## 2. The drone

**Revised.** The original advice here was to download a drone from Sketchfab. That changes now
that the module exists as a clean, hard-surface, matte object: a photoscanned or heavily
textured download would sit beside it looking like it came from a different production. Two
objects sharing one shot need to share a visual language, and consistency beats absolute realism
in a hero. Build the drone the same way the module was built.

Keep it **stylised and precise rather than photoreal**. A simplified quadcopter with crisp
forms will read as a technical illustration, which suits the page. A half-attempted realistic
one will read as a bad game asset.

### Prompt

```
A folding camera quadcopter drone, stylised and clean rather than photoreal, in matte dark
graphite with the same finish as the puck module.

Central body: a rounded rectangular fuselage roughly 220 x 100 x 85 mm, tapering slightly
toward the nose, with softly filleted edges. The rear two thirds of the top face must be a
FLAT horizontal mounting pad, unobstructed, for an accessory to sit on.

Four arms extend from the corners of the body, angled outward, giving a diagonal span of about
380 mm motor to motor. Each arm is a slim tapered strut. At the end of each arm sits a short
cylindrical motor housing, and above each motor a two-blade propeller about 240 mm across, with
thin flat blades that have rounded tips and a gentle twist.

At the front underside, a gimbal assembly: a small bracket holding a rounded camera housing
with a circular lens facing forward.

Two slim landing skids run front to back along the underside of the body.

No decals, no text, no branding, no exposed screws. Symmetrical. Precise mechanical edges.
```

### Notes

- **The flat mounting pad is a hard requirement.** Beat C attaches the module to the top of the
  drone. A curved top surface makes it float or clip.
- Ask for the propellers as **static geometry**, not motion-blurred discs. Rotation gets
  animated in the browser.
- Export **GLB**, same as the module. Save to `public/models/drone.glb`.
- Target under 150k triangles.
- If the propellers come out clumsy, simplifying them to flat tapered blades is fine — at hero
  camera distance nobody counts blade curvature, and clean beats detailed.

## 3. Environment map

`studio.hdr` from **polyhaven.com/hdris** — free, CC0, no attribution needed.

Pick a neutral studio interior. Search `studio small`, `photo studio`, `empty warehouse`.
Download the **2K** version; 4K and 8K are for film work and will just slow the page down.

This file never appears on screen. It exists so the metal has something to reflect. Without it
the models look like flat grey plastic, which is the usual reason browser 3D looks amateur.
