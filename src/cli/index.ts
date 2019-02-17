import sade from 'sade';
import * as pkg from '../../package.json';

const prog = sade('svelte').version(pkg.version);

prog
	.command('compile <input>')

	.option('-o, --output', 'Output (if absent, prints to stdout)')
	.option('-f, --format', 'Type of output (cjs or esm)', 'esm')
	.option('-n, --name', 'Name for IIFE/UMD export (inferred from filename by default)')
	.option('-m, --sourcemap', 'Generate sourcemap (`-m inline` for inline map)')
	.option('-d, --dev', 'Add dev mode warnings and errors')
	.option('--generate', 'Change generate format between `dom` and `ssr`')
	.option('--no-css', `Don't include CSS (useful with SSR)`)
	.option('--immutable', 'Support immutable data structures')
	.option('--shared', 'Don\'t include shared helpers')
	.option('--customElement', 'Generate a custom element')

	.example('compile App.html > App.js')
	.example('compile src -o dest')
	.example('compile -f umd MyComponent.html > MyComponent.js')

	.action((input, opts) => {
		import('./compile').then(({ compile }) => {
			compile(input, opts);
		});
	})

	.parse(process.argv);