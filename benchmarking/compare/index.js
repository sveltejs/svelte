import fs from 'node:fs';
import path from 'node:path';
import { execSync, fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { safe } from '../utils.js';

// if (execSync('git status --porcelain').toString().trim()) {
// 	console.error('Working directory is not clean');
// 	process.exit(1);
// }

const filename = fileURLToPath(import.meta.url);
const runner = path.resolve(filename, '../runner.js');
const outdir = path.resolve(filename, '../.results');
const report_file = `${outdir}/report.txt`;

fs.mkdirSync(outdir, { recursive: true });

const requested_branches = [];

let PROFILE_DIR = path.resolve(filename, '../.profiles');
fs.mkdirSync(PROFILE_DIR, { recursive: true });

for (const arg of process.argv.slice(2)) {
	if (arg.startsWith('--')) continue;
	if (arg === filename) continue;

	requested_branches.push(arg);
}

if (requested_branches.length === 0) {
	requested_branches.push(
		execSync('git symbolic-ref --short -q HEAD || git rev-parse --short HEAD').toString().trim()
	);
}

const original_ref = execSync('git symbolic-ref --short -q HEAD || git rev-parse --short HEAD')
	.toString()
	.trim();

if (
	requested_branches.length === 1 &&
	!requested_branches.includes('main') &&
	!fs.existsSync(`${outdir}/main.json`)
) {
	requested_branches.push('main');
}

process.on('exit', () => {
	execSync(`git checkout ${original_ref}`);
});

for (const branch of requested_branches) {
	console.group(`Benchmarking ${branch}`);

	const branch_profile_dir = `${PROFILE_DIR}/${safe(branch)}`;
	if (fs.existsSync(branch_profile_dir)) fs.rmSync(branch_profile_dir, { recursive: true, force: true });

	const branch_result_file = `${outdir}/${branch}.json`;
	if (fs.existsSync(branch_result_file)) fs.rmSync(branch_result_file, { force: true });

	execSync(`git checkout ${branch}`);

	await new Promise((fulfil, reject) => {
		const child = fork(runner, [], {
			env: {
				...process.env,
				BENCH_PROFILE_DIR: branch_profile_dir
			}
		});

		child.on('message', (results) => {
			fs.writeFileSync(`${outdir}/${branch}.json`, JSON.stringify(results, null, '  '));
			fulfil();
		});

		child.on('error', reject);
	});

	console.groupEnd();
}

if (PROFILE_DIR !== null) {
	console.log(`\nCPU profiles written to ${PROFILE_DIR}`);
}

const result_files = fs
	.readdirSync(outdir)
	.filter((file) => file.endsWith('.json'))
	.sort((a, b) => a.localeCompare(b));

const branches = result_files.map((file) => file.slice(0, -5));
const results = result_files.map((file) => JSON.parse(fs.readFileSync(`${outdir}/${file}`, 'utf-8')));

if (results.length === 0) {
	console.error(`No result files found in ${outdir}`);
	process.exit(1);
}

fs.writeFileSync(report_file, '');

const write = (str) => {
	fs.appendFileSync(report_file, str + '\n');
	console.log(str);
};

for (let i = 0; i < branches.length; i += 1) {
	write(`${char(i)}: ${branches[i]}`);
}

write('');

for (let i = 0; i < results[0].length; i += 1) {
	write(`${results[0][i].benchmark}`);

	for (const metric of ['time', 'gc_time']) {
		const times = results.map((result) => +result[i][metric]);
		let min = Infinity;
		let max = -Infinity;
		let min_index = -1;

		for (let b = 0; b < times.length; b += 1) {
			const time = times[b];

			if (time < min) {
				min = time;
				min_index = b;
			}

			if (time > max) {
				max = time;
			}
		}

		if (min !== 0) {
			write(`  ${metric}: fastest is ${char(min_index)} (${branches[min_index]})`);
			times.forEach((time, b) => {
				const SIZE = 20;
				const n = Math.round(SIZE * (time / max));

				write(`    ${char(b)}: ${'◼'.repeat(n)}${' '.repeat(SIZE - n)} ${time.toFixed(2)}ms`);
			});
		}
	}

	write('');
}

function char(i) {
	return String.fromCharCode(97 + i);
}
