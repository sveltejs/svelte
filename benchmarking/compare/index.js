import fs from 'node:fs';
import path from 'node:path';
import { execSync, fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { benchmarks } from '../benchmarks.js';

// if (execSync('git status --porcelain').toString().trim()) {
// 	console.error('Working directory is not clean');
// 	process.exit(1);
// }

const filename = fileURLToPath(import.meta.url);
const runner = path.resolve(filename, '../runner.js');
const outdir = path.resolve(filename, '../.results');

if (fs.existsSync(outdir)) fs.rmSync(outdir, { recursive: true });
fs.mkdirSync(outdir);

const branches = [];

for (const arg of process.argv.slice(2)) {
	if (arg.startsWith('--')) continue;
	if (arg === filename) continue;

	branches.push(arg);
}

if (branches.length === 0) {
	branches.push(
		execSync('git symbolic-ref --short -q HEAD || git rev-parse --short HEAD').toString().trim()
	);
}

if (branches.length === 1) {
	branches.push('main');
}

process.on('exit', () => {
	execSync(`git checkout ${branches[0]}`);
});

for (const branch of branches) {
	console.group(`Benchmarking ${branch}`);

	execSync(`git checkout ${branch}`);

	await new Promise((fulfil, reject) => {
		const child = fork(runner);

		child.on('message', (results) => {
			fs.writeFileSync(`${outdir}/${branch}.json`, JSON.stringify(results, null, '  '));
			fulfil();
		});

		child.on('error', reject);
	});

	console.groupEnd();
}

const results = branches.map((branch) => {
	return JSON.parse(fs.readFileSync(`${outdir}/${branch}.json`, 'utf-8'));
});

for (let i = 0; i < results[0].length; i += 1) {
	console.group(`${results[0][i].benchmark}`);

	for (const metric of ['time', 'gc_time']) {
		const times = results.map((result) => +result[i][metric]);
		let min = Infinity;
		let min_index = -1;

		for (let b = 0; b < times.length; b += 1) {
			if (times[b] < min) {
				min = times[b];
				min_index = b;
			}
		}

		if (min !== 0) {
			console.group(`${metric}: fastest is ${branches[min_index]}`);
			times.forEach((time, b) => {
				console.log(`${branches[b]}: ${time.toFixed(2)}ms (${((time / min) * 100).toFixed(2)}%)`);
			});
			console.groupEnd();
		}
	}

	console.groupEnd();
}
