import { render } from 'svelte/server';
import { fastest_test, read_file, write } from '../../../utils.js';
import { compile } from 'svelte/compiler';

const dir = `${process.cwd()}/benchmarking/benchmarks/ssr/wrapper`;

async function compile_svelte() {
	const output = compile(read_file(`${dir}/App.svelte`), {
		generate: 'server'
	});
	write(`${dir}/output/App.js`, output.js.code);

	const module = await import(`${dir}/output/App.js`);

	return module.default;
}

export async function wrapper_bench() {
	const App = await compile_svelte();
	// Do 3 loops to warm up JIT
	for (let i = 0; i < 3; i++) {
		render(App);
	}

	const { timing } = await fastest_test(10, () => {
		for (let i = 0; i < 100; i++) {
			render(App);
		}
	});

	return {
		benchmark: 'wrapper_bench',
		time: timing.time.toFixed(2),
		gc_time: timing.gc_time.toFixed(2)
	};
}
