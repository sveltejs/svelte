import { reactivity_benchmarks } from '../benchmarks/reactivity/index.js';
import { with_cpu_profile } from '../utils.js';

const results = [];
const PROFILE_DIR = process.env.BENCH_PROFILE_DIR;

for (let i = 0; i < reactivity_benchmarks.length; i += 1) {
	const benchmark = reactivity_benchmarks[i];

	process.stderr.write(`Running ${i + 1}/${reactivity_benchmarks.length} ${benchmark.label} `);
	results.push({
		benchmark: benchmark.label,
		...(await with_cpu_profile(PROFILE_DIR, benchmark.label, () => benchmark.fn()))
	});
	process.stderr.write('\x1b[2K\r');
}

process.send(results);
