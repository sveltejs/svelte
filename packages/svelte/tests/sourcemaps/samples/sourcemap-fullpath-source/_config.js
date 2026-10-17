import * as fs from 'node:fs';
import MagicString from 'magic-string';
import { test } from '../../test';

// Simulates a bundler plugin (e.g. a Vite plugin using `magic-string`) that transforms
// the Svelte source *before* it reaches `compile()` and calls `generateMap({ source: id })`
// where `id` is an absolute/fully-qualified module id (as Vite does). The source entry in
// the resulting map is a full path (e.g. `/project/src/App.svelte`) rather than a basename,
// which previously failed to match during map chaining (see #18778) and caused the upstream
// mappings to be silently dropped, producing wrong devtools/stack-trace positions.
const input = fs.readFileSync(new URL('./input.svelte', import.meta.url), 'utf-8');
const src = new MagicString(input);
// Perform a no-op transform but generate the map with a full absolute path as `source`
// (basename is still `input.svelte`), reproducing the scenario from the bug report where
// the reporter tried `m.generateMap({source: id})`, `m.generateMap({file: id})`, etc.
const simulated_vite_id = '/fake/project/path/src/input.svelte';

export default test({
	compileOptions: {
		sourcemap: src.generateMap({ source: simulated_vite_id, hires: true })
	},
	client: [{ str: 'let doubled' }]
});
