import { defineConfig } from 'rolldown';

// runs the version generation as a side-effect of importing
import './scripts/generate-version.js';

export default defineConfig({
	input: 'src/compiler/index.js',
	output: {
		file: 'compiler/index.js',
		format: 'umd',
		name: 'svelte'
	}
});
