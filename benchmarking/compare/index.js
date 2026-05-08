import fs from 'node:fs';
import path from 'node:path';
import { execSync, fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { safe } from '../utils.js';
import { generate_report } from './generate-report.js';

// if (execSync('git status --porcelain').toString().trim()) {
// 	console.error('Working directory is not clean');
// 	process.exit(1);
// }

const filename = fileURLToPath(import.meta.url);
const runner = path.resolve(filename, '../runner.js');
const outdir = path.resolve(filename, '../.results');

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
	if (fs.existsSync(branch_profile_dir))
		fs.rmSync(branch_profile_dir, { recursive: true, force: true });

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

generate_report(outdir);
