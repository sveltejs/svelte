import * as assert from 'assert.js';
import { tick } from 'svelte';
import './main.svelte';

export default async function (target) {
	target.innerHTML = '<custom-element name="world"></custom-element>';
	await tick();

	const el = target.querySelector('custom-element');
	const h1 = el.querySelector('h1');

	assert.equal(el.name, 'world');
	assert.equal(el.shadowRoot, null);
	assert.equal(h1.innerHTML, 'Hello world!');
	assert.equal(getComputedStyle(h1).color, 'rgb(255, 0, 0)');
}
