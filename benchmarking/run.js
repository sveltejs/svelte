import * as $ from '../packages/svelte/src/internal/client/index.js';
import { reactivity_benchmarks } from './benchmarks/reactivity/index.js';
import { ssr_benchmarks } from './benchmarks/ssr/index.js';

// e.g. `pnpm bench kairo` to only run the kairo benchmarks
const filters = process.argv.slice(2);

let total_time = 0;
let total_gc_time = 0;

const suites = [
	{
		benchmarks: reactivity_benchmarks.filter(
			(b) => filters.length === 0 || filters.some((f) => b.label.includes(f))
		),
		name: 'reactivity benchmarks'
	},
	{
		benchmarks: ssr_benchmarks.filter(
			(b) => filters.length === 0 || filters.some((f) => b.label.includes(f))
		),
		name: 'server-side rendering benchmarks'
	}
].filter((suite) => suite.benchmarks.length > 0);

if (suites.length === 0) {
	console.log('No benchmarks matched provided filters');
	process.exit(1);
}

const COLUMN_WIDTHS = [25, 9, 9];
const TOTAL_WIDTH = COLUMN_WIDTHS.reduce((a, b) => a + b);

const pad_right = (str, n) => str + ' '.repeat(n - str.length);
const pad_left = (str, n) => ' '.repeat(n - str.length) + str;

$.push({}, true);

try {
	for (const { benchmarks, name } of suites) {
		let suite_time = 0;
		let suite_gc_time = 0;

		console.log(`\nRunning ${name}...\n`);
		console.log(
			pad_right('Benchmark', COLUMN_WIDTHS[0]) +
				pad_left('Time', COLUMN_WIDTHS[1]) +
				pad_left('GC time', COLUMN_WIDTHS[2])
		);
		console.log('='.repeat(TOTAL_WIDTH));

		for (const benchmark of benchmarks) {
			const results = await benchmark.fn();
			console.log(
				pad_right(benchmark.label, COLUMN_WIDTHS[0]) +
					pad_left(results.time.toFixed(2), COLUMN_WIDTHS[1]) +
					pad_left(results.gc_time.toFixed(2), COLUMN_WIDTHS[2])
			);
			total_time += results.time;
			total_gc_time += results.gc_time;
			suite_time += results.time;
			suite_gc_time += results.gc_time;
		}

		console.log('='.repeat(TOTAL_WIDTH));
		console.log(
			pad_right('suite', COLUMN_WIDTHS[0]) +
				pad_left(suite_time.toFixed(2), COLUMN_WIDTHS[1]) +
				pad_left(suite_gc_time.toFixed(2), COLUMN_WIDTHS[2])
		);
		console.log('='.repeat(TOTAL_WIDTH));
	}
} catch (e) {
	// eslint-disable-next-line no-console
	console.error(e);
	process.exit(1);
}

$.pop();

console.log('');

console.log(
	pad_right('total', COLUMN_WIDTHS[0]) +
		pad_left(total_time.toFixed(2), COLUMN_WIDTHS[1]) +
		pad_left(total_gc_time.toFixed(2), COLUMN_WIDTHS[2])
);
