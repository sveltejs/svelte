import * as assert from 'assert.js';
import { tick } from 'svelte';
import './main.svelte';

export default async function (target) {
	target.innerHTML = '<custom-element></custom-element>';
	await tick();
	const el = target.querySelector('custom-element');

	await el.updateFoo(42);

	const p = el.shadowRoot.querySelector('p');
	assert.equal(p.textContent, '42');
}
