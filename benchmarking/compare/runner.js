import { reactivity_benchmarks } from '../benchmarks/reactivity/index.js';

const results = [];
for (const benchmark of reactivity_benchmarks) {
	const result = await benchmark();
	console.error(result.benchmark);
	results.push(result);
}

process.send(results);
