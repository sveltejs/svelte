import * as fs from 'fs';
import { createBundle } from 'dts-buddy';

for (const name of ['action', 'animate', 'easing', 'internal', 'motion', 'store', 'transition']) {
	fs.writeFileSync(`${name}.d.ts`, `import './types/index.d.ts';
export * from "svelte/${name}";	
`);
}

fs.writeFileSync('index.d.ts', `import './types/index.d.ts';
export * from "svelte";
`);
fs.writeFileSync('compiler.d.ts', `import './types/index.d.ts';
export * from "svelte/compiler";
`);

// TODO: some way to mark these as deprecated
fs.mkdirSync('./types/compiler', { recursive: true });
fs.writeFileSync('./types/compiler/preprocess.d.ts', `import '../index.d.ts';
export * from "svelte/types/compiler/preprocess";
`);
fs.writeFileSync('./types/compiler/interfaces.d.ts', `import '../index.d.ts';
export * from "svelte/types/compiler/interfaces";
`);

await createBundle({
	output: 'types/index.d.ts',
	modules: {
		svelte: 'src/runtime/public.d.ts',
		'svelte/compiler': 'src/compiler/public.d.ts',
		'svelte/types/compiler/preprocess': 'src/compiler/preprocess/public.d.ts',
		'svelte/types/compiler/interfaces': 'src/compiler/interfaces.d.ts',
		'svelte/action': 'src/runtime/action/public.d.ts',
		'svelte/animate': 'src/runtime/animate/public.d.ts',
		'svelte/easing': 'src/runtime/easing/index.js',
		'svelte/internal': 'src/runtime/internal/public.d.ts',
		'svelte/motion': 'src/runtime/motion/public.d.ts',
		'svelte/store': 'src/runtime/store/public.d.ts',
		'svelte/transition': 'src/runtime/transition/public.d.ts'
	}
});
