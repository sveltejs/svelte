import * as assert from 'assert.js';
import { tick } from 'svelte';
import './main.svelte';

export default async function (target) {
	const element = document.createElement('custom-element');
	element.updateFoo('42');
	target.appendChild(element);
	await tick();

	const el = target.querySelector('custom-element');
	const p = el.shadowRoot.querySelector('p');
	assert.equal(p.textContent, '42');
}
