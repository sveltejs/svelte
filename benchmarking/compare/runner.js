import { benchmarks } from '../benchmarks.js';

const results = [];
for (const benchmark of benchmarks) {
	const result = await benchmark();
	console.error(result.benchmark);
	results.push(result);
}

process.send(results);
