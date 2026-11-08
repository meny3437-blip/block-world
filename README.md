# Block World

A mobile-first 3D voxel sandbox game built with React, Three.js, TypeScript and Vite.

## Current game systems

- Procedural voxel terrain with forest, desert, tundra, highland, shore and dimension-specific terrain.
- Five dimensions: Overworld, Nether, End, Sky Islands and Deep Ocean.
- More than 100 block types in the building catalog.
- Survival and Creative modes with health, hunger, thirst, stamina, weather and a day/night cycle.
- 27-slot inventory, hotbar, crafting recipes, resource collection and local autosave.
- Craftable, interactive chests with per-chest storage that persists separately in each dimension.
- Survival tool progression: axes are required to harvest logs and pickaxes to mine mineral ores; Creative mode bypasses tool requirements.
- Touch joystick, touch camera controls, mobile action buttons, keyboard/mouse and browser gamepad support.
- Portal travel, independently saved dimension terrain and shared player inventory.
- Passive animals and hostile monsters with creature health, drops, night pursuit and respawning.
- Craftable wooden, stone and iron swords; bow and arrows; leather armor.
- Ender Dragon boss encounter in the End with a live boss health bar, and dragon armor crafted from its scales.

## Controls

| Action | Desktop | Mobile |
|---|---|---|
| Move | WASD / arrow keys | Left virtual joystick |
| Look | Mouse | Drag on the right side of the world |
| Break block | Left mouse button | Pickaxe button |
| Place block | Right mouse button | Block button |
| Jump | Space | Up-arrow button |
| Attack / shoot | F | Sword button |
| Inventory / open a targeted chest | E | Backpack button (opens a chest when aimed at one) |
| Portal | G | Portal button when nearby |
| Select hotbar | 1–9 | Tap a hotbar slot |

A bow with arrows in the inventory enables ranged attacks. The strongest available sword is selected automatically. Armor is applied automatically, with dragon armor taking priority over leather armor. Chests transfer all carried items in or out and save their contents locally with the world.

## Run locally

Requirements: Node.js 22 or newer.

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
npm run preview
```

Run automated inventory tests:

```bash
npm test
```

## Quality checks

GitHub Actions runs the automated inventory unit tests and the Vite production build for pushes and pull requests to `main`.

`tests/*.test.mjs` contains executable Node.js tests for inventory collection, consumption and crafting, chest transfers, weapon selection, attack damage and armor mitigation. `tests/tests.json` is the manual gameplay QA plan; those gameplay scenarios still require browser/device testing and are not represented as automated tests.

## Save data

Worlds and player progress are stored locally in the browser. Each dimension has its own world seed, terrain edits and player position. Player inventory and survival stats are shared across dimensions. Clearing browser site data can remove local saves.
