import { execFile } from 'node:child_process';
import versions from '../src/lib/docs/versions.js';
import { existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const force = true; //process.env.FORCE_UPDATE === 'true';

const docs_dir = fileURLToPath(new URL('./previous-docs', import.meta.url));
const new_docs_dir = join(docs_dir, 'documentation');

if (!existsSync(docs_dir)) mkdirSync(docs_dir);

for (const version of versions) {
	// Check if docs are already checked out
	const version_dir = join(docs_dir, version.version);
	if (!force && existsSync(version_dir)) {
		console.log(`Docs for '${version.version}' already exist, skipping`);
		continue;
	}
	// Delete dir 'previous-docs/documentation'
	rmSync(new_docs_dir, { recursive: true, force: true });
	// Checkout docs to 'previous-docs/documentation'
	const args = [`--work-tree=${docs_dir}`, 'checkout', version.git_ref, '--', 'documentation'];
	await new Promise((resolve, reject) => {
		execFile('git', args, (error) => {
			if (error) reject(error);
			else resolve();
		});
	});
	// Rename 'previous-docs/documentation' to 'previous-docs/<version>'
	rmSync(version_dir, { recursive: true, force: true });
	renameSync(new_docs_dir, version_dir);
}
