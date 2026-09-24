import * as fs from 'node:fs';
import MagicString from 'magic-string';
import { test } from '../../test';

// Simulates a bundler plugin (e.g. a Vite plugin using `magic-string`) that transforms
// the Svelte source *before* it reaches `compile()`, and hands its own sourcemap to
// `compileOptions.sourcemap` — the documented way to let svelte chain an upstream map
// into its own output map. Crucially, the upstream map is generated *without* a `source`
// option, exactly like `new MagicString(code).generateMap()` — this yields a sourcemap
// whose `sources` is `['']`, which previously broke the chain entirely (see #18491)
// instead of being treated as "this file", causing every mapping through it to resolve
// to `{ source: null, line: null, column: null }`.
const input = fs.readFileSync(new URL('./input.svelte', import.meta.url), 'utf-8');
const src = new MagicString(input);
src.overwrite(
	src.original.indexOf('count * 2'),
	src.original.indexOf('count * 2') + 'count * 2'.length,
	'count * 2',
	{
		storeName: false
	}
);

export default test({
	compileOptions: {
		sourcemap: src.generateMap({ hires: true })
	},
	client: [{ str: 'let doubled' }]
});
