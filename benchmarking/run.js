import * as $ from '../packages/svelte/src/internal/client/index.js';
import { benchmarks } from './benchmarks.js';

let total_time = 0;
let total_gc_time = 0;

// eslint-disable-next-line no-console
console.log('-- Benchmarking Started --');
$.push({}, true);
try {
	for (const benchmark of benchmarks) {
		const results = await benchmark();
		// eslint-disable-next-line no-console
		console.log(results);
		total_time += Number(results.time);
		total_gc_time += Number(results.gc_time);
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
// eslint-disable-next-line no-console
console.log({
	total_time: total_time.toFixed(2),
	total_gc_time: total_gc_time.toFixed(2)
});
