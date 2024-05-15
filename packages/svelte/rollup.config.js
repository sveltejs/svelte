import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { defineConfig } from 'rollup';

// runs the version generation as a side-effect of importing
import './scripts/generate-version.js';

export default defineConfig({
	input: 'src/compiler/index.js',
	output: {
		file: 'compiler/index.js',
		format: 'umd',
		name: 'svelte'
	},
	plugins: [resolve(), commonjs(), terser()]
});
