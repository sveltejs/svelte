import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { analyze_compiler_profiles } from './analyze-compiler-profile.js';

const root = path.resolve(fileURLToPath(import.meta.url), '../..');
const profiles_root = path.join(root, 'benchmarking/.profiles/compiler-tests');
const requested_name = process.env.SVELTE_PROFILE_NAME;
const run_name = safe(requested_name || new Date().toISOString().replaceAll(':', '-'));
const run_dir = path.join(profiles_root, run_name);
const raw_dir = path.join(run_dir, 'raw');
const test_args = process.argv.slice(2);
const sampling_interval = process.env.SVELTE_CPU_PROF_INTERVAL || '5000';

if (fs.existsSync(run_dir)) {
	console.error(`Profile run already exists: ${path.relative(root, run_dir)}`);
	process.exit(1);
}

fs.mkdirSync(raw_dir, { recursive: true });

const revision = spawnSync('git', ['rev-parse', 'HEAD'], {
	cwd: root,
	encoding: 'utf8'
});
const started_at = new Date().toISOString();
const manifest_file = path.join(run_dir, 'manifest.json');
const command = [
	'pnpm',
	'test',
	'--execArgv=--cpu-prof',
	`--execArgv=--cpu-prof-dir=${raw_dir}`,
	`--execArgv=--cpu-prof-interval=${sampling_interval}`,
	...test_args
];

write_manifest({
	command,
	revision: revision.status === 0 ? revision.stdout.trim() : null,
	started_at,
	status: 'running'
});

console.log(`Compiler profiles will be written to ${path.relative(root, run_dir)}`);

const result = spawnSync(command[0], command.slice(1), {
	cwd: root,
	stdio: 'inherit'
});

let analysis_error = null;

try {
	analyze_compiler_profiles(run_dir);
	fs.writeFileSync(path.join(profiles_root, 'latest.txt'), `${run_name}\n`);
} catch (error) {
	analysis_error = error instanceof Error ? error.stack || error.message : String(error);
	console.error(analysis_error);
}

write_manifest({
	command,
	revision: revision.status === 0 ? revision.stdout.trim() : null,
	started_at,
	finished_at: new Date().toISOString(),
	status: result.status === 0 && analysis_error === null ? 'completed' : 'failed',
	test_exit_code: result.status,
	test_signal: result.signal,
	analysis_error
});

if (result.error) {
	console.error(result.error);
}

if (result.status === 0 && analysis_error === null) {
	console.log(
		`Compiler flame graph: ${path.relative(root, path.join(run_dir, 'flamegraph.speedscope.json'))}`
	);
	console.log(`Compiler hotspot summary: ${path.relative(root, path.join(run_dir, 'summary.md'))}`);
} else {
	process.exitCode = result.status || 1;
}

/** @param {string} value */
function safe(value) {
	return value.replace(/[^a-z0-9._-]+/gi, '_');
}

/** @param {Record<string, unknown>} manifest */
function write_manifest(manifest) {
	fs.writeFileSync(manifest_file, `${JSON.stringify(manifest, null, '\t')}\n`);
}
