import * as assert from 'assert';
import './main.svelte';

export default function (target) {
	const warnings = [];
	const warn = console.warn;

	console.warn = warning => {
		warnings.push(warning);
	};

	target.innerHTML = '<my-app foo=yes />';

	assert.deepEqual(warnings, [
		`<my-app> was created without expected prop 'bar'`
	]);

	console.warn = warn;
}