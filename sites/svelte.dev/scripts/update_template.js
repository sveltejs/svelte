// @ts-check
import { lstat, readFile, stat, writeFile } from 'node:fs/promises';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sh from 'shelljs';

const force = process.env.FORCE_UPDATE === 'true';

const __dirname = dirname(fileURLToPath(import.meta.url));
sh.cd(path.join(__dirname, '..'));

const outputFile = 'static/svelte-app.json';

try {
	if (!force && (await stat(outputFile))) {
		console.info(`[update/template] ${outputFile} exists. Skipping`);
		process.exit(0);
	}
} catch {
	// fetch svelte app
	sh.rm('-rf', 'scripts/svelte-app');
	sh.exec('npx degit sveltejs/template scripts/svelte-app');

	// remove src (will be recreated client-side) and node_modules
	sh.rm('-rf', 'scripts/svelte-app/src');
	sh.rm('-rf', 'scripts/svelte-app/node_modules');

	// build svelte-app.json
	const appPath = 'scripts/svelte-app';
	const files = [];

	for (const path of sh.find(appPath)) {
		// Skip directories
		if (!(await lstat(path)).isFile()) continue;

		const bytes = await readFile(path);
		const string = bytes.toString();
		const data = bytes.compare(Buffer.from(string)) === 0 ? string : [...bytes];
		files.push({ path: path.slice(appPath.length + 1), data });
	}

	writeFile(outputFile, JSON.stringify(files));
}
