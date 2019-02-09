import * as assert from 'assert';
import './main.svelte';

export default function (target) {
	target.innerHTML = '<custom-element name="world"></custom-element>';
	const el = target.querySelector('custom-element');

	assert.equal(el.name, 'world');

	const h1 = el.shadowRoot.querySelector('h1');
	assert.equal(h1.textContent, 'Hello world!');
}