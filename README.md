# Oasis Aquatic Centre — WebXR Facility Map POC

A frontend-only interactive 3D facility map built with Three.js and WebXR. It opens directly into the map, works with mouse/touch in a normal browser, and offers immersive VR navigation in Meta Quest Browser.

The current building geometry and text are purpose-built placeholders because no client CAD, final zone schedule, brand pack, Arabic copy, or API key was present in the supplied folder. The project is structured so those items can be replaced without rebuilding the interaction layer.

## What is included

- Stylised, extruded facility model with walls, pools, circulation, entrance and context landscaping
- Six named interactive zones:
  - Main competition pool
  - Training pool
  - Changing rooms
  - Main entrance
  - Reception
  - Spectator seating
- Hover highlighting, map labels, click/trigger selection and animated focus states
- Zone information panel with area and operating status
- English/Arabic UI switch, right-to-left layout and placeholder Arabic copy
- Desktop orbit/zoom controls and responsive mobile layout
- WebXR entry button, dual-controller rays and trigger selection
- Left thumbstick movement while in VR
- No backend, database, account or API dependency

## Quick start

Requirements: Node.js 20.19+ or 22.12+ and npm.

```bash
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

Production build:

```bash
npm run build
npm run preview
```

The deployable output is generated in `dist/`.

## How to use the map

### Desktop

1. Drag anywhere outside the UI panels to rotate around the building.
2. Use the mouse wheel or trackpad to zoom.
3. Hover over a colored zone to highlight it.
4. Click a zone in the model or the zone list to open its details.
5. Select **Focus on map** to center the chosen zone.
6. Use **عربي / EN** in the top-right corner to switch language.
7. Select **?** to display the built-in controls guide.

### Meta Quest

1. Deploy the app to an HTTPS URL. WebXR is blocked on ordinary, non-secure network URLs.
2. Open that URL in Meta Quest Browser.
3. Select **Enter VR** at the lower-right.
4. Point either controller at a colored zone.
5. Press the controller trigger to select it.
6. Use the left controller thumbstick to move forward, backward or sideways.
7. Use the browser/system control to leave immersive mode.

For same-network testing, a plain address such as `http://192.168.x.x:5173` is not considered a secure context and may not expose WebXR. Use an HTTPS tunnel or deploy a preview build.

## Recommended deployment

Any static host with HTTPS works. No server functions are needed.

### Netlify or Cloudflare Pages

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 22

### Vercel

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

After deployment, test both the normal browser view and **Enter VR** in Quest Browser. A public HTTPS demo URL is also necessary to satisfy the job description's review requirement.

## Project layout

```text
.
├── index.html          UI shell and accessibility labels
├── src/
│   ├── main.js         Scene, facility geometry, zones, interaction and WebXR
│   └── styles.css      Responsive UI, panels and Arabic RTL layout
├── package.json        Development and build scripts
└── dist/               Generated production build (after npm run build)
```

## Replacing the sample content

### Zone names, descriptions and colors

Edit the `zones` array near the top of `src/main.js`. Each zone has:

- `id`: stable internal identifier
- `number`: display order
- `color`: Three.js hexadecimal color
- `position`: `[x, y, z]` scene coordinates
- `size`: `[width, height, depth]`
- `area`: displayed metric
- `en`: English title and description
- `ar`: Arabic title and description

Keep IDs unique. The zone list, labels, hover behavior, XR selection and detail panel are all generated from this array.

### Final Arabic copy

Replace:

1. Arabic zone titles/descriptions in the `zones` array.
2. Shared interface strings in `copy.ar`.

The document direction and panel placement switch automatically. Final Arabic copy should still be reviewed in-headset because long labels may need shorter map-specific variants.

### Brand direction

Update the color tokens at the top of `src/styles.css`, especially `--mint`, `--panel` and `--line`. Replace the CSS-built `.brand-mark` and the OASIS name in `index.html` with the supplied SVG logo when available.

Use SVG or compressed WebP/AVIF for interface assets. Avoid large PNG files in Quest because texture memory is limited.

## Replacing the placeholder model with client CAD

The current scene is generated procedurally in `src/main.js`; this is appropriate for a demo while CAD is unavailable. For the final client file, use the following pipeline:

1. Clean the CAD file in AutoCAD, Rhino, SketchUp or Blender:
   - remove dimensions, title blocks, hidden layers and duplicate lines;
   - close all room and pool outlines;
   - verify units and set the origin close to the facility;
   - separate floor, wall, pool, seating and circulation layers.
2. Import the cleaned drawing into Blender.
3. Convert closed curves to meshes and extrude:
   - floor slab: approximately 0.1–0.2 m;
   - walls: approximately 1.0–1.8 m for map readability;
   - pool water: shallow visible volumes rather than full-depth basins.
4. Apply transforms, simplify geometry and merge non-interactive static meshes.
5. Name selectable objects using zone IDs, for example `zone_main-pool`.
6. Export as binary glTF (`facility.glb`) with Draco or Meshopt compression.
7. Put the file in `public/models/facility.glb`.
8. Load it with Three.js `GLTFLoader`, traverse named meshes, and assign each matching object to `state.interactive` and `state.zoneObjects`.

Recommended model targets for Quest:

- Under 100k–150k visible triangles for this map-style scene
- Fewer than 50 draw calls where practical
- 1K textures for most surfaces; 2K only for high-value branded artwork
- Baked ambient occlusion rather than real-time high-cost lighting
- Mesh compression enabled
- No unseen ceilings, underside geometry or tiny CAD details

Maintain metres as the model unit. The current scene uses Y-up coordinates, with X/Z as the floor plane.

## Connecting an API later

No API is needed by this POC. If the supplied API key is intended for live occupancy, schedules or wayfinding:

- Do not place a secret key directly in frontend source.
- Only use a browser-exposable key that is restricted by domain and API scope.
- Add live values to the selected zone in `selectZone()`.
- Keep a static fallback so the demo remains usable if the service is unavailable.

If the credential must remain secret, the “frontend only” constraint would need to change because a small server-side proxy is required.

## Browser and headset notes

- Chrome/Edge: desktop map supported; WebXR depends on device/runtime.
- Meta Quest Browser: intended immersive target.
- Safari/iOS: desktop/touch map supported, immersive WebXR is not the target.
- WebXR requires HTTPS except on `localhost`.
- Hand tracking is requested as an optional session feature, but interaction is controller-first for predictable demo behavior.

## Validation checklist

- Run `npm run build`.
- Load the deployed HTTPS URL in Quest Browser.
- Confirm **Enter VR** appears.
- Confirm both controller rays display.
- Select each of the six zones with a trigger.
- Test left-thumbstick movement.
- Check English and Arabic labels in headset.
- Verify the map remains legible and comfortably scaled from the initial VR position.
- Replace all placeholder client content before the final presentation.

## Known POC boundaries

- The geometry is illustrative and is not derived from the missing CAD file.
- Arabic wording is placeholder content, not client-approved copy.
- Occupancy/status values are static.
- There is no route-finding algorithm or room-level search.
- The build prioritizes fast visual impact and demo clarity over production architecture, as requested.
