import * as fs from 'fs';
import * as path from 'path';
import { mkdirp } from './helpers';
import * as svelte from 'svelte/compiler';

type Compile = typeof svelte.compile;
type CompileOptions = Parameters<Compile>[1];

const extensions = ['.svelte', '.html'];
let compileOptions = {};
let compile;
let folderName = 'normal';

const sveltePath = process.cwd().split('\\').join('/');

function capitalise(name: string) {
	return name[0].toUpperCase() + name.slice(1);
}

export function setCompileOptions(_compileOptions: CompileOptions) {
	compileOptions = _compileOptions;
}

export function setCompile(_compile: Compile) {
	compile = _compile;
}

export function setOutputFolderName(_folderName: string) {
	folderName = _folderName;
}

export function clearRequireCache() {
	Object.keys(require.cache)
		.filter(x => x.endsWith('.svelte'))
		.forEach(file => {
			delete require.cache[file];
		});
}

function registerExtension(extension: string) {
	require.extensions[extension] = function (module, filename) {
		const name = path
			.parse(filename)
			.name.replace(/^\d/, '_$&')
			.replace(/[^a-zA-Z0-9_$]/g, '');

		const options = Object.assign({}, compileOptions, {
			filename,
			sveltePath,
			name: capitalise(name),
			format: 'cjs'
		});

		const {
			js: { code }
		} = compile(fs.readFileSync(filename, 'utf-8'), options);

		if (!process.env.CI) {
			saveGeneratedOutputToCache(code, filename);
		}

		return module._compile(code, filename);
	};
}

const outputCache = new Map();
function saveGeneratedOutputToCache(code: string, filename: string) {
	filename = filename.split('\\').join('/');
	filename = filename.replace(
		/samples\/([^/]+)\/(.*)\.svelte$/,
		`samples/$1/_output/${folderName}/$2.js`
	);
	outputCache.set(filename, code);
}

export function clearCompileOutputCache() {
	outputCache.clear();
}

export function writeCompileOutputCacheToFile() {
	for (const [filename, code] of outputCache) {
		mkdirp(path.dirname(filename));
		fs.writeFileSync(filename, code, 'utf8');
	}
	clearCompileOutputCache();
}

extensions.forEach(registerExtension);
