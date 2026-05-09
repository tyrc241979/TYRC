# Step-by-step Google AI Studio reference for the VR lab

Use this guide to recreate or extend the WebXR cell-culture lab in Google AI Studio, then paste the generated code into this static WebXR project.

## 1. Define the target

- Browser: Chrome with WebXR support.
- Headsets: any WebXR-capable VR headset that can run Chrome or a compatible Chromium browser.
- Topic source: Google Drive folder named `Cell_Culture_16042026` from the provided URL.
- Training goal: let learners practice the visual sequence of a cell-culture workflow in a realistic virtual lab.

## 2. Prepare storyboard references

Create a concise storyboard table before prompting AI Studio:

| Step | Scene station | Learner action | Feedback |
| --- | --- | --- | --- |
| 1 | PPE and prep bench | Review PPE and disinfect the work area | Safety checklist appears |
| 2 | Biosafety cabinet | Identify clean-air zone and safe hand movement | Cabinet hotspot explains aseptic workflow |
| 3 | Microscope bench | Inspect morphology and confluence | Morphology guidance appears |
| 4 | Incubator | Confirm labels and storage conditions | Traceability checklist appears |
| 5 | Waste station | Decontaminate and dispose of waste | Completion message appears |

If the Drive folder contains additional storyboard slides or images, map each file to one of these steps and replace the placeholder text in `src/main.js`.

## 3. Prompt Google AI Studio

Start with this prompt:

```text
Build a Chrome-compatible WebXR virtual reality training app using JavaScript modules and Three.js. Create a realistic interactive 3D cell-culture laboratory with a biosafety cabinet, microscope, incubator, lab benches, glassware, pipettes, waste station, sterile lighting, and glowing hotspots. Include desktop controls for non-VR preview and VR controller ray selection for headsets. Use the storyboard steps: PPE preparation, biosafety cabinet workflow, morphology inspection, incubation/labeling, and decontamination/waste. Keep assets procedural so the app can run without external 3D files.
```

Then refine with:

```text
Add a floating UI panel that opens when a learner selects a hotspot. Each panel should include the station title, the learner action, and the feedback text from my storyboard. Make the lab visually realistic with shadows, metal materials, transparent glass, tiled floors, and cool fluorescent lighting.
```

## 4. Add headset guidance

Ask AI Studio to include these implementation rules:

- Use `renderer.xr.enabled = true`.
- Add `VRButton.createButton(renderer)`.
- Use raycasting for mouse clicks and XR controller `selectstart`.
- Keep interaction targets large enough to select easily in a headset.
- Use HTTPS, localhost, or a trusted development tunnel because WebXR requires a secure context.

## 5. Replace reference content with final assets

After AI Studio creates the draft:

1. Copy storyboard text into the `storyboard` array in `src/main.js`.
2. If you have Drive images, place optimized copies in `public/assets/`.
3. Add image planes or texture maps to the appropriate station.
4. Keep filenames lowercase and web-safe, such as `public/assets/cell-culture-step-01.jpg`.
5. Rebuild with `npm run build` and test in Chrome.

## 6. Test checklist

- Desktop Chrome loads without console errors.
- Drag-to-look and WASD movement work.
- Every hotspot opens the right instruction panel.
- The **Enter VR** button appears on a compatible device.
- Controller select opens hotspot panels in headset mode.
- Frame rate remains comfortable after adding final assets.
