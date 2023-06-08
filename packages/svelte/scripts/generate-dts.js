import { createBundle } from 'dts-buddy';

await createBundle({
	output: 'types/index.d.ts',
	modules: {
		svelte: 'src/runtime/public.d.ts',
		'svelte/compiler': 'src/compiler/public.d.ts',
		'svelte/types/compiler/preprocess': 'src/compiler/preprocess/public.d.ts',
		'svelte/action': 'src/runtime/action/public.d.ts',
		'svelte/animate': 'src/runtime/animate/public.d.ts',
		'svelte/easing': 'src/runtime/easing/index.js',
		'svelte/motion': 'src/runtime/motion/public.d.ts',
		'svelte/store': 'src/runtime/store/public.d.ts',
		'svelte/transition': 'src/runtime/transition/public.d.ts'
	}
});
