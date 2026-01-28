import { reactivity_benchmarks } from '../benchmarks/reactivity/index.js';

const results = [];

for (let i = 0; i < reactivity_benchmarks.length; i += 1) {
	const benchmark = reactivity_benchmarks[i];

	process.stderr.write(`Running ${i + 1}/${reactivity_benchmarks.length} ${benchmark.label} `);
	results.push({ benchmark: benchmark.label, ...(await benchmark.fn()) });
	process.stderr.write('\x1b[2K\r');
}

process.send(results);
