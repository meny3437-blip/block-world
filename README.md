# Block World

A mobile-first 3D voxel sandbox built with React, TypeScript, Three.js and Vite.

## Features

- Procedurally generated voxel terrain with varied biomes.
- Five explorable dimensions: Overworld, Nether, End, Sky Islands and Deep Ocean.
- Independent world seeds, edited blocks and player positions per dimension.
- Shared player inventory and survival profile across dimensions.
- Survival and Creative modes with health, hunger, thirst and stamina.
- Automatic local saves, manual save/load and position restoration.
- Mobile touch joystick, touch camera controls and action buttons.
- Desktop keyboard/mouse controls and browser gamepad support.
- Crafting recipes for building materials, tools, weapons, armor, campfires and food.
- Six low-poly creature types: cow, sheep, pig, zombie, skeleton and spider.
- Hostile creature pursuit at night, melee combat, bow attacks, loot and respawning.
- Three sword tiers, leather armor and cooked-meat nutrition.
- Portal travel between dimensions.

## Controls

### Desktop
- WASD: move
- Mouse: look around
- Left mouse button: break a block
- Right mouse button: place a block
- E: inventory
- 1–9: select hotbar slot
- Space: jump
- G: use a nearby portal

### Mobile
- Left virtual joystick: move
- Drag the right side of the screen: look around
- On-screen action controls: jump, break, place, attack and interact
- Use the portal button when close to a portal

A compatible browser gamepad is also supported.

## Run locally

Requirements: Node.js 22 or later and npm.

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
npm run preview
```

Run automated unit tests:

```bash
npm test
```

## Continuous integration

GitHub Actions runs the inventory unit tests and builds the production bundle on pushes and pull requests to `main`.

The current automated unit tests cover inventory addition, consumption, crafting atomicity and invalid quantities. The broader gameplay scenarios in `tests/tests.json` are a manual QA plan; they are not automated browser tests.

## Save data

World and player progress are stored locally in the browser on the device being used. Clearing browser storage or using a different device/browser can remove or hide local saves. There is currently no cloud account or cross-device save synchronization.

## Project status

Block World is an actively developed sandbox prototype. The listed features are implemented in the codebase, but this project is not a complete feature-for-feature Minecraft replacement. Gameplay, balancing, performance and mobile/desktop compatibility still require ongoing hands-on testing.
