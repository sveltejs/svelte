import * as $ from '../packages/svelte/src/internal/client/index.js';
import { reactivity_benchmarks } from './benchmarks/reactivity/index.js';
import { ssr_benchmarks } from './benchmarks/ssr/index.js';

let total_time = 0;
let total_gc_time = 0;

const suites = [
	{ benchmarks: reactivity_benchmarks, name: 'reactivity benchmarks' },
	{ benchmarks: ssr_benchmarks, name: 'server-side rendering benchmarks' }
];

// eslint-disable-next-line no-console
console.log('\x1b[1m', '-- Benchmarking Started --', '\x1b[0m');
$.push({}, true);
try {
	for (const { benchmarks, name } of suites) {
		let suite_time = 0;
		let suite_gc_time = 0;
		// eslint-disable-next-line no-console
		console.log(`\nRunning ${name}...\n`);

		for (const benchmark of benchmarks) {
			const results = await benchmark();
			// eslint-disable-next-line no-console
			console.log(results);
			total_time += Number(results.time);
			total_gc_time += Number(results.gc_time);
			suite_time += Number(results.time);
			suite_gc_time += Number(results.gc_time);
		}

		console.log(`\nFinished ${name}.\n`);

		// eslint-disable-next-line no-console
		console.log({
			suite_time: suite_time.toFixed(2),
			suite_gc_time: suite_gc_time.toFixed(2)
		});
	}
} catch (e) {
	// eslint-disable-next-line no-console
	console.log('\x1b[1m', '\n-- Benchmarking Failed --\n', '\x1b[0m');
	// eslint-disable-next-line no-console
	console.error(e);
	process.exit(1);
}
$.pop();
// eslint-disable-next-line no-console
console.log('\x1b[1m', '\n-- Benchmarking Complete --\n', '\x1b[0m');
// eslint-disable-next-line no-console
console.log({
	total_time: total_time.toFixed(2),
	total_gc_time: total_gc_time.toFixed(2)
});
