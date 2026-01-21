import * as $ from '../packages/svelte/src/internal/client/index.js';
import { reactivity_benchmarks } from './benchmarks/reactivity/index.js';
import { ssr_benchmarks } from './benchmarks/ssr/index.js';

let total_time = 0;
let total_gc_time = 0;

const suites = [
	{ benchmarks: reactivity_benchmarks, name: 'reactivity benchmarks' },
	{ benchmarks: ssr_benchmarks, name: 'server-side rendering benchmarks' }
];

const pad_right = (str, n) => str + ' '.repeat(n - str.length);
const pad_left = (str, n) => ' '.repeat(n - str.length) + str;

$.push({}, true);

try {
	for (const { benchmarks, name } of suites) {
		let suite_time = 0;
		let suite_gc_time = 0;

		console.log(`\nRunning ${name}...\n`);
		console.log(`${pad_right('Benchmark', 30)} ${pad_left('Time', 7)} ${pad_left('GC time', 9)}`);
		console.log('='.repeat(48));

		for (const benchmark of benchmarks) {
			const results = await benchmark();
			console.log(
				`${pad_right(results.benchmark, 30)} ${pad_left(results.time.toFixed(2), 7)} ${pad_left(results.gc_time.toFixed(2), 9)}`
			);
			total_time += results.time;
			total_gc_time += results.gc_time;
			suite_time += results.time;
			suite_gc_time += results.gc_time;
		}

		console.log('='.repeat(48));
		console.log(
			`${pad_right('suite', 30)} ${pad_left(suite_time.toFixed(2), 7)} ${pad_left(suite_gc_time.toFixed(2), 9)}`
		);
		console.log('='.repeat(48));
	}
} catch (e) {
	// eslint-disable-next-line no-console
	console.error(e);
	process.exit(1);
}

$.pop();

console.log('');

console.log(
	`${pad_right('total', 30)} ${pad_left(total_time.toFixed(2), 7)} ${pad_left(total_gc_time.toFixed(2), 9)}`
);
