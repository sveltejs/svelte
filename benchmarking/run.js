import * as $ from '../packages/svelte/src/internal/client/index.js';
import { benchmarks } from './benchmarks.js';

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
