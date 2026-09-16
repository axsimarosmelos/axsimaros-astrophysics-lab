# Axsimaros Astrophysics Lab · Observatory II

A colorful, interactive 3D observatory with six WebGL scenes, a space newsroom, and a searchable astrophysics library. Runs directly in a browser, without installing an app or building a JavaScript bundle.

**Website:** https://axsimarosmelos.github.io/axsimaros-astrophysics-lab/ (available after GitHub Pages is enabled).

## Explore the observatory

- **Solar system:** image-mapped planets, night lights, atmospheric rims, clouds, Saturn's rings, modeled moons, inclined Keplerian orbits, and instantaneous orbital measurements. Follow a planet or compare compact and linear distance scales.
- **Black hole:** numerical ray bending around a compact object, an accretion disk, a shadow, and a Doppler brightness comparison. Adjust mass and compare with bending disabled.
- **Binary stars:** a variable mass ratio, common barycenter, computed period, and a radial-velocity plot that responds to viewing angle.
- **Spiral galaxy:** 48,000 stellar tracers, differential rotation, warm bulge, spiral arms, and an emitting volume with dust attenuation.
- **Nebula:** a continuous 3D density field, multiscale filaments, ray-marched emission and absorption, adjustable density, and two illustrative color palettes.
- **Exoplanet transit:** adjustable planet size, impact parameter, limb darkening, and numerically integrated relative flux.

The analytical Cartesian/polar grid adapts to camera scale without a finite square boundary. Camera damping, pinch/scroll zoom, scene bookmarks, cinematic orbit, theater view, exposure, bloom, and detail settings provide control over the experience.

The newsroom retrieves recent Spaceflight News API articles and includes official NASA, SpaceX, and ESA links. Network failures are labeled and fall back to the last successful cache or dated selected stories. The library contains 12 introductory articles, source links, search, reading progress, and local bookmarks.

## Publish on GitHub Pages

1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Choose **main** and **/ (root)**, then click **Save**.
4. Wait for GitHub's deployment to complete, then open the website link above.

All paths are relative, so the site works under the repository's project URL. `.nojekyll` tells GitHub Pages to serve these static files directly. No API keys, server, database, or package installation are required.

## Local development

From the repository folder, run `python3 -m http.server 8000` and visit `http://localhost:8000`. Use a modern browser with WebGL enabled. The news feed and optional Google Fonts require an internet connection; all simulation code and planetary maps are included.

`index.html` defines the interface, `styles.css` its appearance, `shaders.js` the GPU programs, `engine.js` the 3D engine, `lab.js` the scientific controls and plots, `data.js` the articles and fallback stories, and `app.js` the navigation, search, preferences, and news integration.

## Scientific scope

This is an educational visual observatory, not research software. Planetary elements are approximate and positions are not live ephemerides. Bodies are enlarged; compact distances are logarithmic. Linear mode applies a common distance scale while retaining enlarged bodies. Surface rotation and moon spacing are adjusted for viewing. The binary model is circular and Newtonian. Black-hole bending and brightness are physically inspired approximations, not validated relativistic radiative transfer. The galaxy does not solve self-gravity, and the nebula is an illustrative density field, not a calibrated observation. Transit photometry integrates stellar annuli using a linear limb-darkening law.

The interface describes these assumptions alongside each scene. It links to learning sources rather than presenting the illustrations as observational data.

## Validation

All six GPU scenes were compiled and rendered using an OpenGL ES replay of the engine's WebGL commands, with no shader or GL errors. Checks also covered orbital closure, a uniform-star transit depth, extreme grid zoom, scene controls, navigation, search, bookmarks, motion preferences, and live/cached/fallback news handling. Device-specific browser performance and fullscreen behavior can vary.

See [CREDITS.md](CREDITS.md) and [THIRD-PARTY-LICENSES.txt](THIRD-PARTY-LICENSES.txt) for image provenance and third-party terms. Independent project; not affiliated with NASA, ESA, or SpaceX.
