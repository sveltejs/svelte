import * as $ from '../packages/svelte/src/internal/client/index.js';
import { mol_bench } from './benchmarks/mol_bench.js';

const benchmarks = [mol_bench];

async function run_benchmarks() {
	const results = [];

	$.push({}, true);
	for (const benchmark of benchmarks) {
		results.push(await benchmark());
	}
	$.pop();

	// eslint-disable-next-line no-console
	console.log(results);
}

run_benchmarks();
