import * as assert from 'assert';
import './main.svelte';

export default async function (target) {
	target.innerHTML = '<custom-element></custom-element>';
	const el = target.querySelector('custom-element');

	assert.equal(el.getHost(), el);
	assert.equal(el.host, el);

	assert.equal(el.shadowRoot.textContent, 'object');
}