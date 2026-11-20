import * as fs from 'node:fs';
import MagicString from 'magic-string';
import { test } from '../../test';

// A plugin passes `compileOptions.sourcemap` a map whose `sources[0]` is a full path
// (`generateMap({ source: id })` with an absolute module id, as bundlers commonly do).
//
// The chain itself is not dropped without this fix: `compile` still composes the upstream
// map and positions trace back to the component. What is wrong is the source *name* — the
// full path is carried into the output map, so the map claims to point at a file that does
// not exist (`/fake/project/path/src/input.svelte`) instead of the component. This sample
// pins the corrected name (`js_map_sources` defaults to `../../input.svelte`).
const input = fs.readFileSync(new URL('./input.svelte', import.meta.url), 'utf-8');
const src = new MagicString(input);
// A no-op transform: this sample is about how the incoming source is named, not about
// shifting lines.
const simulated_vite_id = '/fake/project/path/src/input.svelte';

export default test({
	compileOptions: {
		sourcemap: src.generateMap({ source: simulated_vite_id, hires: true })
	},
	client: [{ str: 'let doubled' }]
});
