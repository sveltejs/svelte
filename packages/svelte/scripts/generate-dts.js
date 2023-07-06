import * as fs from 'fs';
import { createBundle } from 'dts-buddy';

// It may look weird, but the imports MUST be ending with index.js to be properly resolved in all TS modes
for (const name of ['action', 'animate', 'easing', 'motion', 'store', 'transition']) {
	fs.writeFileSync(`${name}.d.ts`, `import './types/index.js';`);
}

fs.writeFileSync('index.d.ts', `import './types/index.js';`);
fs.writeFileSync('compiler.d.ts', `import './types/index.js';`);

// TODO: some way to mark these as deprecated
fs.mkdirSync('./types/compiler', { recursive: true });
fs.writeFileSync('./types/compiler/preprocess.d.ts', `import '../index.js';`);
fs.writeFileSync('./types/compiler/interfaces.d.ts', `import '../index.js';`);

await createBundle({
	output: 'types/index.d.ts',
	compilerOptions: {
		strict: true
	},
	modules: {
		svelte: 'src/runtime/public.d.ts',
		'svelte/compiler': 'src/compiler/public.d.ts',
		'svelte/types/compiler/preprocess': 'src/compiler/preprocess/public.d.ts',
		'svelte/types/compiler/interfaces': 'src/compiler/interfaces.d.ts',
		'svelte/action': 'src/runtime/action/public.d.ts',
		'svelte/animate': 'src/runtime/animate/public.d.ts',
		'svelte/easing': 'src/runtime/easing/index.js',
		'svelte/motion': 'src/runtime/motion/public.d.ts',
		'svelte/store': 'src/runtime/store/public.d.ts',
		'svelte/transition': 'src/runtime/transition/public.d.ts'
	}
});

// There's no way to tell in JS that a class can have arbitrary properties, so we need to add that manually
const types = fs.readFileSync('types/index.d.ts', 'utf-8');
fs.writeFileSync(
	'types/index.d.ts',
	// same line to not affect source map
	types.replace(/export class SvelteComponent<[^{]*{/, '$& [prop: string]: any;')
);
