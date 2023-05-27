import * as assert from 'assert.js';
import { tick } from 'svelte';
import './main.svelte';

export default async function (target) {
	target.innerHTML = '<custom-element></custom-element>';
	await tick();
	assert.equal(target.innerHTML, '<custom-element></custom-element>');

	const el = target.querySelector('custom-element');
	const button = el.shadowRoot.querySelector('button');

	assert.ok(button instanceof customElements.get('custom-button'));
}
