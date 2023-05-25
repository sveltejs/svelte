import * as assert from 'assert.js';
import { tick } from 'svelte';
import './main.svelte';

export default async function (target) {
	const warnings = [];
	const warn = console.warn;

	console.warn = (warning) => {
		warnings.push(warning);
	};

	target.innerHTML = '<my-app foo=yes />';
	await tick();

	assert.deepEqual(warnings, ["<my-app> was created without expected prop 'bar'"]);

	console.warn = warn;
}
