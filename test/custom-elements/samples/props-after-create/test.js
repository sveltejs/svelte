import * as assert from 'assert';
import CustomElement from './main.svelte';

export default async function (target) {

	// initialize without options to simulate instantiation within HTML
	const el = new CustomElement();

	assert.equal(el.outerHTML, '<custom-element></custom-element>');

	el.items = ['a', 'b', 'c'];
	const p0 = el.shadowRoot.querySelector('p');

	// shouldn't be instantitated yet
	assert.equal(p0, undefined);

	// simulate adding to DOM to trigger setup
	el.connectedCallback();

	const [p1, p2] = el.shadowRoot.querySelectorAll('p');
	assert.equal(p1.textContent, '3 items');
	assert.equal(p2.textContent, 'a, b, c');

	el.items = ['d', 'e', 'f', 'g', 'h'];

	assert.equal(p1.textContent, '5 items');
	assert.equal(p2.textContent, 'd, e, f, g, h');
}
