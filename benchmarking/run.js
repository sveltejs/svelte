import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as $ from '../packages/svelte/src/internal/client/index.js';
import { reactivity_benchmarks } from './benchmarks/reactivity/index.js';
import { ssr_benchmarks } from './benchmarks/ssr/index.js';
import { with_cpu_profile } from './utils.js';

const PROFILE_DIR = './benchmarking/.profiles';

const single = process.env.BENCH_SINGLE;

if (single) {
	// child mode — run a single benchmark and report the result to the parent
	const benchmark = [...reactivity_benchmarks, ...ssr_benchmarks].find((b) => b.label === single);

	if (!benchmark) {
		throw new Error(`Unknown benchmark ${single}`);
	}

	$.push({}, true);

	const result = await with_cpu_profile(PROFILE_DIR, benchmark.label, () => benchmark.fn());

	$.pop();

	// exit via the callback so the message is guaranteed to be delivered
	/** @type {NodeJS.Process} */ (process).send(result, () => process.exit(0));
} else {
	// parent mode — run every benchmark in its own child process, so that
	// heap/GC/JIT state from one benchmark cannot contaminate the others

	// e.g. `pnpm bench kairo` to only run the kairo benchmarks
	const filters = process.argv.slice(2);

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

	const filename = fileURLToPath(import.meta.url);

	/**
	 * @param {string} label
	 * @returns {Promise<{ time: number, gc_time: number }>}
	 */
	const run_benchmark = (label) => {
		return new Promise((fulfil, reject) => {
			const child = fork(filename, [], {
				env: {
					...process.env,
					BENCH_SINGLE: label
				}
			});

			/** @type {{ time: number, gc_time: number } | null} */
			let result = null;

			child.on('message', (message) => {
				result = /** @type {{ time: number, gc_time: number }} */ (message);
			});

			child.on('error', reject);

			child.on('exit', (code) => {
				if (result === null) {
					reject(new Error(`benchmark ${label} exited with code ${code}`));
				} else {
					fulfil(result);
				}
			});
		});
	};

	const COLUMN_WIDTHS = [25, 9, 9];
	const TOTAL_WIDTH = COLUMN_WIDTHS.reduce((a, b) => a + b);

	/** @type {(str: string, n: number) => string} */
	const pad_right = (str, n) => str + ' '.repeat(n - str.length);
	/** @type {(str: string, n: number) => string} */
	const pad_left = (str, n) => ' '.repeat(n - str.length) + str;

	let total_time = 0;
	let total_gc_time = 0;

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
				const results = await run_benchmark(benchmark.label);
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

		console.log(`\nCPU profiles written to ${PROFILE_DIR}`);
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error(e);
		process.exit(1);
	}

	console.log('');

	console.log(
		pad_right('total', COLUMN_WIDTHS[0]) +
			pad_left(total_time.toFixed(2), COLUMN_WIDTHS[1]) +
			pad_left(total_gc_time.toFixed(2), COLUMN_WIDTHS[2])
	);
}
