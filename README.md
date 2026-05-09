# Cell Culture VR Lab Reference

A Chrome WebXR reference app for a realistic interactive 3D cell-culture laboratory. It is designed as a starting point for building a VR headset experience from Google AI Studio prompts and can be adapted to the storyboard assets in the provided Google Drive folder, `Cell_Culture_16042026`.

## Features

- WebXR-ready scene for Chrome with the built-in **Enter VR** button.
- Realistic procedural 3D lab including benches, biosafety cabinet, microscope, incubator, glassware, pipettes, waste station, tiled floor, lighting, and wall storyboard.
- Interactive glowing hotspots for a five-step cell-culture learning flow.
- Desktop fallback controls: drag to look, WASD/arrow keys to move, click hotspots.
- VR controls: enter VR on a compatible HTTPS origin, point a controller at a hotspot, and press select.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in Chrome. WebXR headset mode requires Chrome on a WebXR-compatible device and a secure origin, so use HTTPS or localhost during development.

## Build

```bash
npm run build
```

The static production build is emitted to `dist/`.
