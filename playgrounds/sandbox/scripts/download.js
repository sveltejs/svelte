import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { execSync } from 'node:child_process';
import { chromium } from 'playwright';

const { values, positionals } = parseArgs({
	options: {
		'create-test': {
			type: 'string'
		}
	},
	allowPositionals: true
});

const create_test_name = values['create-test'] ?? null;
const url_arg = positionals[0];

if (!url_arg) {
	console.error(`Missing URL argument`);
	process.exit(1);
}

const base_dir = import.meta.dirname;

/**
 * Check if the argument is a local directory path
 * @param {string} arg
 * @returns {boolean}
 */
function is_local_directory(arg) {
	try {
		return fs.existsSync(arg) && fs.statSync(arg).isDirectory();
	} catch {
		return false;
	}
}

// Check if it's a local directory first (before URL parsing)
const is_local = is_local_directory(url_arg);

const resolved_test_path = ['runtime-runes', 'runtime-legacy']
	.map((d) => path.resolve(`${base_dir}/../../../packages/svelte/tests/${d}/samples/${url_arg}`))
	.find(fs.existsSync);

/** @type {URL | null} */
let url = null;

if (!is_local && !resolved_test_path) {
	try {
		url = new URL(url_arg);
	} catch (e) {
		console.error(`${url_arg} is not a valid URL or local directory`);
		process.exit(1);
	}
}

/**
 * Check if URL is a GitHub repository URL
 * @param {URL} url
 * @returns {boolean}
 */
function is_github_url(url) {
	return url.hostname === 'github.com' && url.pathname.split('/').filter(Boolean).length >= 2;
}

/**
 * Check if URL is a StackBlitz GitHub project URL
 * @param {URL} url
 * @returns {boolean}
 */
function is_stackblitz_github_url(url) {
	return url.hostname === 'stackblitz.com' && url.pathname.startsWith('/github/');
}

/**
 * Check if URL is a StackBlitz edit project URL (non-GitHub)
 * @param {URL} url
 * @returns {boolean}
 */
function is_stackblitz_edit_url(url) {
	return url.hostname === 'stackblitz.com' && url.pathname.startsWith('/edit/');
}

/**
 * Extract GitHub repo info from a StackBlitz GitHub URL
 * @param {URL} url
 * @returns {{ owner: string, repo: string, path?: string }}
 */
function extract_stackblitz_github_info(url) {
	// URL format: /github/owner/repo or /github/owner/repo/tree/branch/path
	const parts = url.pathname.split('/').filter(Boolean);
	// parts[0] = 'github', parts[1] = owner, parts[2] = repo
	return {
		owner: parts[1],
		repo: parts[2],
		path: parts.length > 3 ? parts.slice(3).join('/') : undefined
	};
}

/**
 * Clone a GitHub repository to a temporary directory
 * @param {URL} url
 * @param {string} target_dir
 */
function clone_github_repo(url, target_dir) {
	// Extract repo URL (handle both https://github.com/owner/repo and https://github.com/owner/repo/tree/branch/path)
	const parts = url.pathname.split('/').filter(Boolean);
	const owner = parts[0];
	const repo = parts[1];
	const repo_url = `https://github.com/${owner}/${repo}.git`;

	console.log(`Cloning ${repo_url}...`);
	execSync(`git clone --depth 1 ${repo_url} "${target_dir}"`, { stdio: 'inherit' });
}

/**
 * Clone a StackBlitz GitHub project to a temporary directory
 * (Converts to regular GitHub clone)
 * @param {URL} url
 * @param {string} target_dir
 */
function clone_stackblitz_github_project(url, target_dir) {
	const info = extract_stackblitz_github_info(url);
	const repo_url = `https://github.com/${info.owner}/${info.repo}.git`;

	console.log(`StackBlitz GitHub project detected, cloning from ${repo_url}...`);

	execSync(`git clone --depth 1 ${repo_url} "${target_dir}"`, { stdio: 'inherit' });
}

/**
 * Download a StackBlitz project using browser automation
 * @param {URL} url
 * @param {string} target_dir
 */
async function download_stackblitz_project(url, target_dir) {
	console.log(`Downloading StackBlitz project via browser automation...`);
	console.log(`URL: ${url.href}`);

	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({ acceptDownloads: true });
	const page = await context.newPage();

	try {
		// Navigate to the StackBlitz project
		console.log('Loading StackBlitz project (this may take a moment)...');
		await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 20000 });

		// Set up download handler
		const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
		await page.locator('button[aria-label*="Download Project" i]', { timeout: 30000 }).click();
		console.log('Triggering download...');

		// Wait for the download to start
		const download = await downloadPromise;

		// Save the downloaded file
		const zip_path = path.join(target_dir, 'project.zip');
		await download.saveAs(zip_path);

		console.log('Download complete, extracting...');

		// Extract the zip file
		if (process.platform === 'win32') {
			execSync(
				`powershell -Command "Expand-Archive -Path '${zip_path}' -DestinationPath '${target_dir}' -Force"`,
				{ stdio: 'inherit' }
			);
		} else {
			execSync(`unzip -o "${zip_path}" -d "${target_dir}"`, { stdio: 'inherit' });
		}

		// Remove the zip file
		fs.unlinkSync(zip_path);

		// Check if files were extracted into a subdirectory
		const entries = fs.readdirSync(target_dir);
		if (entries.length === 1) {
			const subdir = path.join(target_dir, entries[0]);
			if (fs.statSync(subdir).isDirectory()) {
				// Move files from subdirectory to target_dir
				const subentries = fs.readdirSync(subdir);
				for (const entry of subentries) {
					fs.renameSync(path.join(subdir, entry), path.join(target_dir, entry));
				}
				fs.rmdirSync(subdir);
			}
		}

		console.log('StackBlitz project downloaded successfully');
	} finally {
		await browser.close();
	}
}

/**
 * Recursively get all files in a directory
 * @param {string} dir
 * @param {string} base
 * @returns {Array<{path: string, name: string, contents: string}>}
 */
function get_all_files(dir, base = '') {
	/** @type {Array<{path: string, name: string, contents: string}>} */
	const results = [];

	if (!fs.existsSync(dir)) return results;

	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const full_path = path.join(dir, entry.name);
		const relative_path = base ? `${base}/${entry.name}` : entry.name;

		if (entry.isDirectory()) {
			// Skip node_modules, .git, etc.
			if (['node_modules', '.git', '.svelte-kit', 'build', 'dist'].includes(entry.name)) {
				continue;
			}
			results.push(...get_all_files(full_path, relative_path));
		} else if (
			entry.name.endsWith('.svelte') ||
			entry.name.endsWith('.js') ||
			entry.name.endsWith('.ts')
		) {
			results.push({
				path: relative_path,
				name: entry.name,
				contents: fs.readFileSync(full_path, 'utf-8')
			});
		}
	}

	return results;
}

/**
 * Detect project type from files
 * @param {Array<{path: string, name: string, contents: string}>} files
 * @returns {{ type: 'sveltekit' | 'vite', has_app_imports: boolean, has_page_svelte: boolean }}
 */
function detect_project_type(files) {
	let has_app_imports = false;
	let has_page_svelte = false;

	for (const file of files) {
		// Check for $app/* imports
		if (/from\s+['"](\$app\/[^'"]+)['"]/.test(file.contents)) {
			has_app_imports = true;
		}
		// Check for +page.svelte or +layout.svelte
		if (file.name === '+page.svelte' || file.name === '+layout.svelte') {
			has_page_svelte = true;
		}
	}

	return {
		type: has_page_svelte ? 'sveltekit' : 'vite',
		has_app_imports,
		has_page_svelte
	};
}

/**
 * Convert a route path to a PascalCase component name
 * @param {string} route_path - e.g., "about", "blog/post"
 * @returns {string} - e.g., "About", "BlogPost"
 */
function route_to_component_name(route_path) {
	if (!route_path || route_path === '') return 'Page';

	return route_path
		.split('/')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join('');
}

/**
 * Transform $lib/* imports to relative imports (flattened)
 * @param {string} content
 * @returns {string}
 */
function transform_lib_imports(content) {
	// Replace $lib/ imports with relative paths to flattened files
	return content.replace(/from\s+['"](\$lib\/[^'"]+)['"]/g, (match, import_path) => {
		// Get just the filename from the lib path
		const lib_path = import_path.replace('$lib/', '');
		const filename = path.basename(lib_path);
		return `from './${filename}'`;
	});
}

/**
 * Build the route tree from SvelteKit files
 * @param {Array<{path: string, name: string, contents: string}>} files
 * @param {string} routes_prefix - e.g., "src/routes"
 * @returns {Map<string, {layout?: {path: string, contents: string}, page?: {path: string, contents: string}}>}
 */
function build_route_tree(files, routes_prefix) {
	/** @type {Map<string, {layout?: {path: string, contents: string}, page?: {path: string, contents: string}}>} */
	const routes = new Map();

	for (const file of files) {
		if (!file.path.startsWith(routes_prefix)) continue;

		const relative_to_routes = file.path.slice(routes_prefix.length + 1); // +1 for the slash
		const dir = path.dirname(relative_to_routes);
		const route_key = dir === '.' ? '' : dir;

		if (!routes.has(route_key)) {
			routes.set(route_key, {});
		}

		const route = routes.get(route_key);
		if (file.name === '+layout.svelte') {
			route.layout = { path: file.path, contents: file.contents };
		} else if (file.name === '+page.svelte') {
			route.page = { path: file.path, contents: file.contents };
		}
	}

	return routes;
}

/**
 * Get child routes of a given route
 * @param {Map<string, any>} routes
 * @param {string} parent_route
 * @returns {string[]}
 */
function get_child_routes(routes, parent_route) {
	const children = [];
	for (const route of routes.keys()) {
		if (route === parent_route) continue;

		const parent_prefix = parent_route === '' ? '' : parent_route + '/';
		if (
			parent_route === ''
				? !route.includes('/')
				: route.startsWith(parent_prefix) && !route.slice(parent_prefix.length).includes('/')
		) {
			children.push(route);
		}
	}
	return children;
}

/**
 * Transform a layout file's content to replace {@render children()} with a component
 * @param {string} content
 * @param {string} child_component_name
 * @returns {string}
 */
function transform_layout_content(content, child_component_name) {
	// Add import for the child component at the top of the script
	const import_statement = `import ${child_component_name} from './${child_component_name}.svelte';`;

	// Check if there's already a script tag
	if (/<script[^>]*>/.test(content)) {
		// Add import after the opening script tag
		content = content.replace(/(<script[^>]*>)/, `$1\n\t${import_statement}`);
	} else {
		// Add a new script block at the beginning
		content = `<script>\n\t${import_statement}\n</script>\n\n${content}`;
	}

	// Replace {@render children()} or {@render children?.()} with the component
	content = content.replace(/\{@render\s+children\?\.\(\)\}/g, `<${child_component_name} />`);
	content = content.replace(/\{@render\s+children\(\)\}/g, `<${child_component_name} />`);

	return content;
}

/**
 * Convert a SvelteKit project to plain Svelte components
 * @param {string} repo_dir
 * @returns {Array<{name: string, contents: string}>}
 */
function convert_sveltekit_project(repo_dir) {
	const all_files = get_all_files(repo_dir);
	/** @type {Array<{name: string, contents: string}>} */
	const output_files = [];

	// Find the routes directory
	let routes_prefix = '';
	for (const file of all_files) {
		if (file.path.includes('src/routes/')) {
			routes_prefix = 'src/routes';
			break;
		}
	}

	if (!routes_prefix) {
		console.error('Could not find src/routes directory');
		process.exit(1);
	}

	// Build route tree
	const routes = build_route_tree(all_files, routes_prefix);

	// Process lib files - flatten them to root level
	const lib_files = all_files.filter((f) => f.path.startsWith('src/lib/'));
	for (const file of lib_files) {
		// Flatten to just the filename
		const new_path = path.basename(file.path);
		let contents = file.contents;
		contents = transform_lib_imports(contents);
		output_files.push({
			name: new_path,
			contents
		});
	}

	// Sort routes by depth (deepest first) so we can process children before parents
	const sorted_routes = [...routes.keys()].sort((a, b) => {
		const depth_a = a === '' ? 0 : a.split('/').length;
		const depth_b = b === '' ? 0 : b.split('/').length;
		return depth_b - depth_a;
	});

	// Map to store what component each route renders
	/** @type {Map<string, string>} */
	const route_component_map = new Map();

	// First pass: convert all pages
	for (const route_key of sorted_routes) {
		const route = routes.get(route_key);
		if (route?.page) {
			const component_name = route_to_component_name(route_key);
			let contents = route.page.contents;
			contents = transform_lib_imports(contents);
			output_files.push({
				name: `${component_name}.svelte`,
				contents
			});
			// If no layout, this is what the route renders
			if (!route.layout) {
				route_component_map.set(route_key, component_name);
			}
		}
	}

	// Second pass: convert layouts (from deepest to root)
	for (const route_key of sorted_routes) {
		const route = routes.get(route_key);
		if (route?.layout) {
			const is_root = route_key === '';
			const component_name = is_root ? 'App' : route_to_component_name(route_key) + 'Layout';

			// Determine what child component this layout should render
			let child_component = '';

			// Check if there's a page at this route level
			if (route.page) {
				child_component = route_to_component_name(route_key);
			} else {
				// Find child routes that have content
				const children = get_child_routes(routes, route_key);
				if (children.length > 0) {
					// Use the first child's component (or its layout if it has one)
					const first_child = children[0];
					child_component =
						route_component_map.get(first_child) || route_to_component_name(first_child);
				}
			}

			let contents = route.layout.contents;
			contents = transform_lib_imports(contents);

			if (child_component) {
				contents = transform_layout_content(contents, child_component);
			} else {
				// No child, just remove {@render children()} or {@render children?.()}
				contents = contents.replace(/\{@render\s+children\?\.\(\)\}/g, '<!-- no child content -->');
				contents = contents.replace(/\{@render\s+children\(\)\}/g, '<!-- no child content -->');
			}

			output_files.push({
				name: `${component_name}.svelte`,
				contents
			});

			// This route now renders the layout
			route_component_map.set(route_key, component_name);
		}
	}

	// If there's no root layout but there's a root page, rename it to App.svelte
	if (!routes.get('')?.layout && routes.get('')?.page) {
		const page_index = output_files.findIndex((f) => f.name === 'Page.svelte');
		if (page_index !== -1) {
			output_files[page_index].name = 'App.svelte';
		}
	}

	// If there's no App.svelte yet, create one that imports the first available component
	if (!output_files.some((f) => f.name === 'App.svelte')) {
		const first_component = output_files.find(
			(f) => f.name.endsWith('.svelte') && !f.name.includes('/')
		);
		if (first_component) {
			const comp_name = first_component.name.replace('.svelte', '');
			output_files.push({
				name: 'App.svelte',
				contents: `<script>\n\timport ${comp_name} from './${first_component.name}';\n</script>\n\n<${comp_name} />\n`
			});
		}
	}

	return output_files;
}

/**
 * Convert a regular Vite+Svelte project
 * @param {string} repo_dir
 * @returns {Array<{name: string, contents: string}>}
 */
function convert_vite_project(repo_dir) {
	const all_files = get_all_files(repo_dir);
	/** @type {Array<{name: string, contents: string}>} */
	const output_files = [];

	// Find src directory
	const src_files = all_files.filter(
		(f) =>
			f.path.startsWith('src/') &&
			(f.name.endsWith('.svelte') || f.name.endsWith('.js') || f.name.endsWith('.ts'))
	);

	for (const file of src_files) {
		// Flatten all files to root level (just the filename)
		const new_path = path.basename(file.path);

		let contents = file.contents;
		contents = transform_lib_imports(contents);

		output_files.push({
			name: new_path,
			contents
		});
	}

	return output_files;
}

/**
 * Process a local or cloned directory
 * @param {string} dir_path
 * @returns {Array<{name: string, contents: string}>}
 */
function process_directory(dir_path) {
	const all_files = get_all_files(dir_path);
	const project_info = detect_project_type(all_files);

	console.log(`Detected project type: ${project_info.type}`);

	// Check for $app/* imports
	if (project_info.has_app_imports) {
		console.error('Error: This SvelteKit project uses $app/* imports which cannot be converted.');
		console.error('The playground does not support SvelteKit runtime features.');
		process.exit(1);
	}

	// Convert based on project type
	if (project_info.type === 'sveltekit') {
		console.log('Converting SvelteKit project to plain Svelte...');
		return convert_sveltekit_project(dir_path);
	} else {
		console.log('Processing Vite+Svelte project...');
		return convert_vite_project(dir_path);
	}
}

/**
 * Reset a directory so it exists and is empty
 * @param {string} dir_path
 */
/**
 * Create a temporary directory, run an action, and always clean up
 * @param {string} base_dir
 * @param {(dir: string) => void | Promise<void>} action
 */
async function with_tmp_dir(base_dir, action) {
	const tmp_dir = path.join(base_dir, '.tmp-repo');

	try {
		if (fs.existsSync(tmp_dir)) {
			fs.rmSync(tmp_dir, { recursive: true, force: true });
		}
		fs.mkdirSync(tmp_dir, { recursive: true });
		await action(tmp_dir);
	} finally {
		if (fs.existsSync(tmp_dir)) {
			fs.rmSync(tmp_dir, { recursive: true, force: true });
		}
	}
}

// Main logic
let files;

// Check if it's a local directory first (before URL parsing)
if (is_local) {
	console.log(`Processing local directory: ${url_arg}`);
	files = process_directory(url_arg);
} else if (resolved_test_path) {
	// Copy files from test
	console.log(`Processing test ${url_arg}`);
	files = get_all_files(resolved_test_path)
		.filter((file) => !file.path.includes('_'))
		.map((file) => {
			return {
				name: file.name === 'main.svelte' ? 'App.svelte' : file.name,
				contents: file.contents
			};
		});
} else if (url && is_github_url(url)) {
	// GitHub repository handling
	await with_tmp_dir(base_dir, (tmp_dir) => {
		clone_github_repo(url, tmp_dir);
		files = process_directory(tmp_dir);
	});
} else if (url && is_stackblitz_github_url(url)) {
	// StackBlitz GitHub project handling (redirect to GitHub clone)
	await with_tmp_dir(base_dir, (tmp_dir) => {
		clone_stackblitz_github_project(url, tmp_dir);
		files = process_directory(tmp_dir);
	});
} else if (url && is_stackblitz_edit_url(url)) {
	// StackBlitz edit URLs - use browser automation to download
	await with_tmp_dir(base_dir, async (tmp_dir) => {
		await download_stackblitz_project(url, tmp_dir);
		files = process_directory(tmp_dir);
	});
} else if (url && url.origin === 'https://svelte.dev' && url.pathname.startsWith('/playground/')) {
	// Svelte playground URL handling (existing logic)
	if (url.hash.length > 1) {
		// Decode percent-encoded characters (e.g., %5F => _), and replace base64 chars.
		let decodedHash;
		try {
			// First, decode URI components to handle %xx encodings (e.g. %5F -> _) (LLMs calling this script sometimes encode them for some reason)
			decodedHash = url.hash.slice(1);
			decodedHash = decodeURIComponent(decodedHash);

			// Now, restore for base64 (replace -/+, _/ /)
			decodedHash = atob(
				decodedHash.replaceAll('-', '+').replaceAll('_', '/')
			);
		} catch (e) {
			console.error('Failed to decode URL hash:', e);
			process.exit(1);
		}
		// putting it directly into the blob gives a corrupted file
		const u8 = new Uint8Array(decodedHash.length);
		for (let i = 0; i < decodedHash.length; i++) {
			u8[i] = decodedHash.charCodeAt(i);
		}
		const stream = new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'));
		const json = await new Response(stream).text();

		files = JSON.parse(json).files;
	} else {
		const id = url.pathname.split('/')[2];
		const response = await fetch(`https://svelte.dev/playground/api/${id}.json`);

		files = (await response.json()).components.map((data) => {
			const basename = `${data.name}.${data.type}`;

			return {
				type: 'file',
				name: basename,
				basename,
				contents: data.source,
				text: true
			};
		});
	}
} else {
	console.error(
		`${url_arg} is not a supported URL (Svelte playground, GitHub repository, or StackBlitz project)`
	);
	process.exit(1);
}

// Output files
if (create_test_name) {
	const test_parts = create_test_name.split('/').filter(Boolean);

	if (test_parts.length > 2) {
		console.error(
			`Invalid test name "${create_test_name}". Expected e.g. "hello-world" or "runtime-legacy/hello-world"`
		);
		process.exit(1);
	}

	const suite_name = test_parts.length === 2 ? test_parts[0] : 'runtime-runes';
	const test_name = test_parts[test_parts.length - 1];

	const output_dir = path.join(
		base_dir,
		'../../..',
		'packages/svelte/tests',
		suite_name,
		'samples',
		test_name
	);
	if (fs.existsSync(output_dir)) {
		console.warn(`Test folder "${output_dir}" already exists, overriding its contents`);
		fs.rmSync(output_dir, { recursive: true, force: true });
	}
	fs.mkdirSync(output_dir, { recursive: true });

	for (const file of files) {
		const output_name = file.name === 'App.svelte' ? 'main.svelte' : file.name;
		const output_path = path.join(output_dir, output_name);

		fs.mkdirSync(path.dirname(output_path), { recursive: true });
		fs.writeFileSync(output_path, file.contents);
	}

	fs.writeFileSync(
		path.join(output_dir, '_config.js'),
		`import { test } from '../../test';

export default test({
	async test({ assert, target }) {
	}
});
`
	);

	console.log(`Test created at ${output_dir}`);
} else {
	for (const file of files) {
		const output_path = path.join(base_dir, '..', 'src', file.name);
		fs.mkdirSync(path.dirname(output_path), { recursive: true });
		fs.writeFileSync(output_path, file.contents);
	}

	console.log(`Files written to ${path.join(base_dir, '..', 'src')}`);
}
