import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'rollup';

// runs the version generation as a side-effect of importing
import './scripts/generate-version.js';

export default defineConfig({
	input: 'src/compiler/index.js',
	// the parser picks its engine where it runs, a native addon or WebAssembly, so the bundle requires it
	external: [/^@teasel\/parser(\/|$)/],
	output: {
		file: 'compiler/index.js',
		format: 'umd',
		name: 'svelte',
		globals: { '@teasel/parser': 'teasel', '@teasel/parser/grammar': 'teasel_grammar' }
	},
	plugins: [resolve(), commonjs(), terser()]
});
