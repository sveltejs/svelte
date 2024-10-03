import { parse } from 'svelte/compiler';
import glob from 'tiny-glob/sync.js';
import { run, bench } from 'mitata';
import { basename } from 'node:path';
import { readFileSync } from 'node:fs';
import {parse as acorn_parse, parse_expression_at} from './src/compiler/phases/1-parse/acorn.js';
import * as swc from 'swc-svelte';
import * as oxc from 'oxc-svelte';
import * as ts from 'typescript';

function extract_samples() {
	const files = glob('tests/**/*.svelte');
	for (const file of files) {
		const source = readFileSync(file, 'utf-8');
		try {
			parse(source);
		} catch (_) {}
	}
}
/** @typedef {{ fn: 'parse', source: string, typescript: boolean } | { fn: 'parse_expression_at', source: string, typescript: boolean, index: number }}  Line */

/**
 * @param {Line} line 
 */
function run_acorn(line) {
	try {
		if (line.fn === 'parse') {
			acorn_parse(line.source, line.typescript);
		} else {
			parse_expression_at(line.source, line.typescript, line.index);
		}
	} catch (_) {  }
}

/** @param {Line} line */
function run_tsc(line) {
	try {
		if (line.fn === 'parse') {
		} else {
			// const file = ts.createSourceFile('anon.ts', line.source, ts.ScriptTarget.ESNext);
			// console.log(file)
		}
	} catch (_) {  }
}

const lines = readFileSync('acorn.log', 'utf-8').trim().split('\n').slice(0, 1000).map(l => JSON.parse(l));
for (const line of lines) {
	if (line.fn !== 'parse_expression_at') continue;
	// console.log(line.source.length)
	const acorn_start = performance.now();
	for (let i = 0; i < 1000; i++) {
		run_acorn(line);
	}
	const acorn_end = performance.now();

	for (let i = 0; i < 1000; i++) {
// run_tsc(line)
		swc.parse_expression_at(line.source, line.index, line.typescript).Expr;
	}
	const swc_end = performance.now();

	for (let i = 0; i < 1000; i++) {
		JSON.parse(oxc.parse_expression_at(line.source, line.index, line.typescript));
	}
	const oxc_end = performance.now();

	const acorn_t = acorn_end - acorn_start;
	const swc_t = swc_end - acorn_end;
	const oxc_t = oxc_end - swc_end;
	console.log(`${line.source.length.toString().padStart(5, ' ')} - SWC: ${Math.round(acorn_t / swc_t * 100)}%, OXC: ${Math.round(acorn_t / oxc_t * 100)}%`);
}


// extract_samples();

