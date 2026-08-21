import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { reactivity_benchmarks } from '../benchmarks/reactivity/index.js';
import { with_cpu_profile } from '../utils.js';

const PROFILE_DIR = process.env.BENCH_PROFILE_DIR ?? null;
const single = process.env.BENCH_SINGLE;

if (single) {
	// child mode — run a single benchmark and report the result to the parent
	const benchmark = reactivity_benchmarks.find((b) => b.label === single);

	if (!benchmark) {
		throw new Error(`Unknown benchmark ${single}`);
	}

	const result = await with_cpu_profile(PROFILE_DIR, benchmark.label, () => benchmark.fn());

	// exit via the callback so the message is guaranteed to be delivered
	/** @type {NodeJS.Process} */ (process).send(result, () => process.exit(0));
} else {
	// parent mode — run every benchmark in its own child process, so that
	// heap/GC/JIT state from one benchmark cannot contaminate the others
	const filename = fileURLToPath(import.meta.url);
	const results = [];

	for (let i = 0; i < reactivity_benchmarks.length; i += 1) {
		const benchmark = reactivity_benchmarks[i];

		process.stderr.write(`Running ${i + 1}/${reactivity_benchmarks.length} ${benchmark.label} `);

		const result = await new Promise((fulfil, reject) => {
			const child = fork(filename, [], {
				env: {
					...process.env,
					BENCH_SINGLE: benchmark.label
				}
			});

			/** @type {object | null} */
			let message_received = null;

			child.on('message', (message) => {
				message_received = /** @type {object} */ (message);
			});

			child.on('error', reject);

			child.on('exit', (code) => {
				if (message_received === null) {
					reject(new Error(`benchmark ${benchmark.label} exited with code ${code}`));
				} else {
					fulfil(message_received);
				}
			});
		});

		results.push({
			benchmark: benchmark.label,
			.../** @type {object} */ (result)
		});

		process.stderr.write('\x1b[2K\r');
	}

	/** @type {NodeJS.Process} */ (process).send(results);
}
