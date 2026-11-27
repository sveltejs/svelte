/* eslint-disable no-console */
import path from 'node:path';
import process from 'node:process';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rollup_bin = path.join(
	path.dirname(require.resolve('rollup/package.json')),
	'dist/bin/rollup'
);

/**
 * @param {string} label
 * @param {string[]} args
 * @param {{ buffered?: boolean }} [options]
 * @returns {Promise<void>}
 */
function run(label, args, options = {}) {
	return new Promise((resolve, reject) => {
		const buffered = options.buffered ?? false;
		const child = spawn(process.execPath, args, {
			stdio: buffered ? ['ignore', 'pipe', 'pipe'] : 'inherit'
		});

		/** @type {Buffer[]} */
		const chunks = [];

		if (buffered) {
			child.stdout?.on('data', (chunk) => chunks.push(chunk));
			child.stderr?.on('data', (chunk) => chunks.push(chunk));
		}

		child.on('error', reject);
		child.on('close', (code) => {
			if (buffered && chunks.length > 0) {
				console.log(`\n── ${label} ──`);
				process.stdout.write(Buffer.concat(chunks));
			}

			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`${label} failed with exit code ${code}`));
			}
		});
	});
}

// Phase 1: generate files imported by the compiler and runtime
await run('generate-version', ['scripts/generate-version.js']);
await run('process-messages', ['scripts/process-messages']);

// Phase 2: independent build/generation/verification tasks in parallel
const results = await Promise.allSettled([
	run('rollup -c', [rollup_bin, '-c'], { buffered: true }),
	run('generate-types', ['scripts/generate-types.js'], { buffered: true }),
	run('generate-browser-support', ['scripts/generate-browser-support.ts'], { buffered: true }),
	run('check-treeshakeability', ['scripts/check-treeshakeability.js'], { buffered: true })
]);

const failures = results.filter((r) => r.status === 'rejected');
if (failures.length > 0) {
	for (const failure of failures) {
		console.error(failure.reason instanceof Error ? failure.reason.message : failure.reason);
	}
	process.exit(1);
}
