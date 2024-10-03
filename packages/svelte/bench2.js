import { run, bench, boxplot } from 'mitata';
import { parse as acorn_parse, parse_expression_at } from './src/compiler/phases/1-parse/acorn.js';
import * as oxc from 'oxc-svelte';
import { readFileSync } from 'fs';
const input = {
	fn: 'parse_expression_at',
	source: readFileSync('./test.svelte', 'utf8'),
			typescript: true,
	index: 7601
};

console.log(oxc.parse_expression_at(input.source, input.index, input.typescript));
boxplot(() => {
	bench('acorn', () => parse_expression_at(input.source, input.typescript, input.index));

	bench('oxc', () => {
		JSON.parse(oxc.parse_expression_at(input.source, input.index, input.typescript));
	});
});
run();
