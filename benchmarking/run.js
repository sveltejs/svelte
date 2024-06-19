import * as $ from '../packages/svelte/src/internal/client/index.js';
import { kairo_avoidable } from './benchmarks/kairo/kairo_avoidable.js';
import { kairo_broad } from './benchmarks/kairo/kairo_broad.js';
import { kairo_deep } from './benchmarks/kairo/kairo_deep.js';
import { kairo_diamond } from './benchmarks/kairo/kairo_diamond.js';
import { kairo_mux } from './benchmarks/kairo/kairo_mux.js';
import { kairo_repeated } from './benchmarks/kairo/kairo_repeated.js';
import { kairo_triangle } from './benchmarks/kairo/kairo_triangle.js';
import { kairo_unstable } from './benchmarks/kairo/kairo_unstable.js';
import { mol_bench } from './benchmarks/mol_bench.js';

// This benchmark has been adapted from the js-reactivity-benchmark (https://github.com/milomg/js-reactivity-benchmark)
// Not all tests are the same, and many parts have been tweaked to capture different data.

const benchmarks = [
	kairo_avoidable,
	kairo_broad,
	kairo_deep,
	kairo_diamond,
	kairo_triangle,
	kairo_mux,
	kairo_repeated,
	kairo_unstable,
	mol_bench
];

async function run_benchmarks() {
	// eslint-disable-next-line no-console
	console.log('-- Benchmarking Started --');
	$.push({}, true);
	try {
		for (const benchmark of benchmarks) {
			// eslint-disable-next-line no-console
			console.log(await benchmark());
		}
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error('-- Benchmarking Failed --');
		// eslint-disable-next-line no-console
		console.error(e);
		process.exit(1);
	}
	$.pop();
	// eslint-disable-next-line no-console
	console.log('-- Benchmarking Complete --');
}

run_benchmarks();
