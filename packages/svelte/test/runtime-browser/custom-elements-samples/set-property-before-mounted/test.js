import * as assert from 'assert.js';
import { tick } from 'svelte';
import Main from './main.svelte';

export default async function (target) {
	target.innerHTML = '<custom-element red white></custom-element>';
	const ce = target.querySelector('custom-element');
	ce.prop = 1;
	customElements.define('custom-element', Main.element);
	await tick();
	await tick();

	const ce_root = target.querySelector('custom-element').shadowRoot;
	const p = ce_root.querySelector('p');

	assert.equal(p.textContent, '1');

	ce.prop = 2;
	await tick();
	await tick();

	assert.equal(p.textContent, '2');
}
