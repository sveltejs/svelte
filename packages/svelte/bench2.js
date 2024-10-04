import { run, bench, boxplot } from 'mitata';
import * as acorn from './src/compiler/phases/1-parse/acorn.js';
import * as oxc from './src/compiler/phases/1-parse/oxc.js';
import { readFileSync } from 'fs';

const input = {
	fn: 'parse',
	source:
		'                  \n\t// yo\n\tlet array: Array<{ id: number; element: HTMLElement | null }> = $state([\n\t\t{ id: 1, element: null },\n\t\t{ id: 2, element: null },\n\t\t{ id: 3, element: null /* yo */ }\n\t]);\n',
	typescript: true
};

console.log(JSON.stringify(oxc.parse(input.source, input.typescript), null, 2));
boxplot(() => {
	bench('acorn', () => acorn.parse(input.source, input.typescript));

	bench('oxc', () => {
		oxc.parse(input.source, input.typescript);
	});
});
run();
