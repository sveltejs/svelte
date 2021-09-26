// Svelte 3 types are generated using TS 3.7 . Using newer type syntax is therefore technically a breaking change.
// `export type` / `import type` was introduced later, and needed now in one of the files.
// Replace `export type` with `export` in the `d.ts` file as it doesn't make a difference in `d.ts` files.
// This keeps backwards-compatibility

const fs = require('fs');

const path = 'types/runtime/index.d.ts';
const content = fs.readFileSync(path, 'utf8');
const replaced = content.replace('export type', 'export');
if (content === replaced) {
    throw new Error('types/runtime/index.d.ts changed. Update post-typegen.js')
}
fs.writeFileSync(path, replaced);
