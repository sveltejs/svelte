import fs from 'node:fs';
import path from 'node:path';
import {
	sbench_create_0to1,
	sbench_create_1000to1,
	sbench_create_1to1,
	sbench_create_1to1000,
	sbench_create_1to2,
	sbench_create_1to4,
	sbench_create_1to8,
	sbench_create_2to1,
	sbench_create_4to1,
	sbench_create_signals
} from './sbench.js';
import { fileURLToPath } from 'node:url';

// This benchmark has been adapted from the js-reactivity-benchmark (https://github.com/milomg/js-reactivity-benchmark)
// Not all tests are the same, and many parts have been tweaked to capture different data.

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const reactivity_benchmarks = [
	sbench_create_signals,
	sbench_create_0to1,
	sbench_create_1to1,
	sbench_create_2to1,
	sbench_create_4to1,
	sbench_create_1000to1,
	sbench_create_1to2,
	sbench_create_1to4,
	sbench_create_1to8,
	sbench_create_1to1000
];

for (const file of fs.readdirSync(`${dirname}/tests`)) {
	if (!file.includes('.bench.')) continue;

	const module = await import(`${dirname}/tests/${file}`);
	reactivity_benchmarks.push(module.default.owned, module.default.unowned);
}
