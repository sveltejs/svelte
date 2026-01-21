import { reactivity_benchmarks } from '../benchmarks/reactivity/index.js';

const results = [];

for (let i = 0; i < reactivity_benchmarks.length; i += 1) {
	const benchmark = reactivity_benchmarks[i];

	process.stderr.write(`${i + 1}/${reactivity_benchmarks.length} (${benchmark.label})`);

	console.error(benchmark.label);
	results.push(await benchmark.fn());

	process.stderr.write('\x1b[2K');
}

process.send(results);
