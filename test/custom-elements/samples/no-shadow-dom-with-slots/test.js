import * as assert from 'assert';
import CustomElement from './main.svelte';

export default function (target) {
	new CustomElement({
		target
	});

	assert.equal(target.innerHTML, '<custom-element><other-element><h1>Hello world!</h1></other-element></custom-element>');

	const el = target.querySelector('custom-element');
	assert.equal(el.innerText, "Hello world!");
}