import * as assert from 'assert';
import './main.html';

export default function (target) {
	const warnings = [];
	const warn = console.warn;

	console.warn = warning => {
		warnings.push(warning);
	};

	target.innerHTML = '<my-app foo=yes />';

	assert.equal(warnings.length, 1);
	assert.equal(warnings[0], `<my-app> was created without expected prop 'bar'`);

	console.warn = warn;
}