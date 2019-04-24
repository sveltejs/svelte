import * as assert from 'assert';
import CustomElement from './main.svelte';

export default function (target) {
	new CustomElement({
		target
	});

	assert.equal(target.innerHTML, '<custom-element><other-element><h1>Hello world!</h1></other-element></custom-element>');

	const el = target.querySelector('custom-element');
	const h1 = el.querySelector('h1');
	const { color } = getComputedStyle(h1);

	assert.equal(h1.textContent, 'Hello world!');
	assert.equal(color, 'rgb(0, 0, 255)');
}