import * as assert from 'assert';
import './main.svelte';

export default function (target) {
	const warnings = [];
	const warn = console.warn;

	console.warn = warning => {
		warnings.push(warning);
	};

	target.innerHTML = '<my-app />';

	assert.equal(warnings.length, 0);

	console.warn = warn;
}
