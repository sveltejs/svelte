import { reactivity_benchmarks } from '../benchmarks/reactivity/index.js';

const results = [];
for (const benchmark of reactivity_benchmarks) {
	console.error(benchmark.label);
	results.push(await benchmark.fn());
}

process.send(results);
