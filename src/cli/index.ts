import sade from 'sade';
import * as pkg from '../../package.json';

const prog = sade('svelte-cli').version(pkg.version);

prog
	.command('compile <input>')

	.option('-o, --output', 'Output (if absent, prints to stdout)')
	.option('-f, --format', 'Type of output (amd, cjs, es, iife, umd)')
	.option('-g, --globals', 'Comma-separate list of `module ID:Global` pairs')
	.option('-n, --name', 'Name for IIFE/UMD export (inferred from filename by default)')
	.option('-m, --sourcemap', 'Generate sourcemap (`-m inline` for inline map)')
	.option('-d, --dev', 'Add dev mode warnings and errors')
	.option('--amdId', 'ID for AMD module (default is anonymous)')
	.option('--generate', 'Change generate format between `dom` and `ssr`')
	.option('--no-css', `Don't include CSS (useful with SSR)`)
	.option('--immutable', 'Support immutable data structures')

	.example('compile App.html > App.js')
	.example('compile src -o dest')
	.example('compile -f umd MyComponent.html > MyComponent.js')

	.action((input, opts) => {
		import('./compile.js').then(({ compile }) => {
			compile(input, opts);
		});
	})

	.parse(process.argv);