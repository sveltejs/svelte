import * as fs from 'node:fs';
import * as path from 'node:path';
import { render } from 'svelte/server';
import { fastest_test } from '../../../utils.js';
import { compile } from 'svelte/compiler';

const dir = `${process.cwd()}/benchmarking/benchmarks/ssr/wrapper`;

async function compile_svelte() {
	const output = compile(read(`${dir}/App.svelte`), {
		generate: 'server'
	});

	write(`${dir}/output/App.js`, output.js.code);

	const module = await import(`${dir}/output/App.js`);

	return module.default;
}

export async function wrapper_bench() {
	const App = await compile_svelte();

	// Do 3 loops to warm up JIT
	for (let i = 0; i < 3; i++) {
		render(App);
	}

	const { time, gc_time } = await fastest_test(10, () => {
		for (let i = 0; i < 100; i++) {
			render(App);
		}
	});

	return {
		benchmark: 'wrapper_bench',
		time: time.toFixed(2),
		gc_time: gc_time.toFixed(2)
	};
}

/**
 * @param {string} file
 */
function read(file) {
	return fs.readFileSync(file, 'utf-8').replace(/\r\n/g, '\n');
}

/**
 * @param {string} file
 * @param {string} contents
 */
function write(file, contents) {
	try {
		fs.mkdirSync(path.dirname(file), { recursive: true });
	} catch {}

	fs.writeFileSync(file, contents);
}
