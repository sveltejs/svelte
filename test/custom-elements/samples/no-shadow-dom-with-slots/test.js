import * as assert from 'assert';
import CustomElement from './main.svelte';

export default function (target) {
	new CustomElement({
		target
	});

	assert.equal(target.innerHTML, '<custom-element><as-element><h1>Hello</h1></as-element><as-imported><h2>world</h2></as-imported></custom-element>');

	const el = target.querySelector('custom-element');
	assert.equal(el.innerText, "Hello world!");
}