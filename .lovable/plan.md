# Cinematic video hero

Replace the Three.js torus in the homepage hero with an AI-generated cinematic model/lifestyle clip of the jewelry, kept as an autoplaying muted looping background with the existing logo, tagline, and "Enter the boutique" button overlaid on top.

## Steps

1. **Generate the video** with `videogen--generate_video`
   - Prompt: slow cinematic close-ups of a model wearing delicate gold jewelry (earrings, necklace, ring) — soft warm rim light, shallow depth of field, olive/gold palette matching the site (#6B7326 / #C9A96E), editorial fashion film feel, subtle motion, film grain.
   - 1920x1080, 10s, `camera_fixed: false` for gentle drift.
   - Save to `src/assets/hero-video.mp4` (auto-becomes an asset pointer).

2. **Swap the hero in `src/routes/index.tsx`**
   - Remove `<Scene3D variant="hero" />` and its import.
   - Add a full-bleed `<video autoPlay muted loop playsInline preload="auto" poster="…">` layer in the same absolute container.
   - Add a dark→transparent gradient overlay (bottom-weighted, ~55% opacity at bottom fading to ~15% at top) so the mega logo, tagline, and Enter button stay legible.
   - Keep hero height (`82vh` / `minHeight: 560`) — no length changes.
   - Keep the mega logo, tagline, and single "Enter the boutique" button exactly as they are, layered above the gradient.

3. **Performance & fallback**
   - `preload="auto"`, `playsInline`, `muted` (required for autoplay), `loop`.
   - Poster: a still frame image so the first paint isn't blank.
   - On mobile (`prefers-reduced-motion` or `<=640px`), fall back to the poster image only — no video decode.

4. **Leave `Scene3D` for `variant="showcase"`** untouched (still used further down the page).

## Files touched
- `src/assets/hero-video.mp4` (new, via videogen)
- `src/assets/hero-poster.jpg` (new, via imagegen — matches video first frame)
- `src/routes/index.tsx` (swap hero visual layer only)

No changes to color scheme, section order, or any other page.
