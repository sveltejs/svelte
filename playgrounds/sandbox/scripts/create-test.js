// Creates a test from the existing playground. cwd needs to be playground/sandbox
import fs from 'fs';
import path from 'path';

// Get target folder from command line arguments
let target_folder = process.argv[2];
if (!target_folder) {
	console.error(
		'Please provide a target folder as an argument. Example: node create-test.js runtime-runes/my-test'
	);
	process.exit(1);
}
if (!target_folder.includes('/')) {
	target_folder = 'runtime-runes/' + target_folder;
}
if (!target_folder.startsWith('runtime-')) {
	console.error(
		'Target folder must start with "runtime-" (can only convert to these kinds of tests)'
	);
	process.exit(1);
}
target_folder = path.join(
	path.resolve('../../packages/svelte/tests', target_folder.split('/')[0]),
	'samples',
	target_folder.split('/')[1]
);

// Create target directory if it doesn't exist
if (!fs.existsSync(target_folder)) {
	fs.mkdirSync(target_folder, { recursive: true });
}

// Starting file
const app_svelte_path = path.resolve('./src/App.svelte');
const collected_files = new Set();
const processed_files = new Set();

function collect_imports(file_path) {
	if (processed_files.has(file_path) || !fs.existsSync(file_path)) {
		return;
	}

	processed_files.add(file_path);
	collected_files.add(file_path);

	const content = fs.readFileSync(file_path, 'utf8');

	// Regex to match import statements
	const import_regex = /import\s+(?:[^'"]*\s+from\s+)?['"]([^'"]+)['"]/g;
	let match;

	while ((match = import_regex.exec(content)) !== null) {
		const import_path = match[1];

		// Skip node_modules imports
		if (!import_path.startsWith('.')) {
			continue;
		}

		// Resolve relative import path
		const resolved_path = path.resolve(path.dirname(file_path), import_path);

		// Try different extensions if file doesn't exist
		const extensions = ['', '.svelte', '.js', '.ts'];
		let actual_path = null;

		for (const ext of extensions) {
			const test_path = resolved_path + ext;
			if (fs.existsSync(test_path)) {
				actual_path = test_path;
				break;
			}
		}

		if (actual_path) {
			collect_imports(actual_path);
		}
	}
}

// Start collecting from App.svelte
collect_imports(app_svelte_path);

// Copy collected files to target folder
for (const file_path of collected_files) {
	const relative_path = path.relative(path.resolve('./src'), file_path);
	let target_path = path.join(target_folder, relative_path);

	// Rename App.svelte to main.svelte
	if (path.basename(file_path) === 'App.svelte') {
		target_path = path.join(target_folder, path.dirname(relative_path), 'main.svelte');
	}

	// Ensure target directory exists
	const target_dir = path.dirname(target_path);
	if (!fs.existsSync(target_dir)) {
		fs.mkdirSync(target_dir, { recursive: true });
	}

	// Copy file
	fs.copyFileSync(file_path, target_path);
	console.log(`Copied: ${file_path} -> ${target_path}`);
}

// Create empty _config.js
const config_path = path.join(target_folder, '_config.js');
fs.writeFileSync(
	config_path,
	`import { test } from '../../test';

export default test({
	async test({ assert, target }) {
	}
});
`
);
console.log(`Created: ${config_path}`);

console.log(`\nTest files created in: ${target_folder}`);
