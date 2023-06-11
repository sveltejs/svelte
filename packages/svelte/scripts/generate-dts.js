import * as fs from 'fs';
import { createBundle } from 'dts-buddy';

fs.mkdirSync('types/faux', { recursive: true });
fs.readdirSync('src/runtime', { withFileTypes: true })
	.filter((dirent) => dirent.isDirectory())
	.forEach((dirent) =>
		fs.writeFileSync(`types/faux/${dirent.name}.d.ts`, `import '../index.d.ts';`)
	);

fs.writeFileSync('types/faux/index.d.ts', `import '../index.d.ts';`);
fs.writeFileSync('types/faux/compiler.d.ts', `import '../index.d.ts';`);

// TODO: some way to mark these as deprecated
fs.mkdirSync('types/faux/types/compiler', { recursive: true });
fs.writeFileSync('types/faux/types/compiler/preprocess.d.ts', `import '../index.d.ts';`);
fs.writeFileSync('types/faux/types/compiler/interfaces.d.ts', `import '../index.d.ts';`);

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
		'svelte/motion': 'src/runtime/motion/public.d.ts',
		'svelte/store': 'src/runtime/store/public.d.ts',
		'svelte/transition': 'src/runtime/transition/public.d.ts'
	}
});
