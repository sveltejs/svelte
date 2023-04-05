import * as assert from 'assert';
import './main.svelte';

export default function (target) {
	target.innerHTML = '<custom-element></custom-element>';
	const icon = target.querySelector('custom-element').shadowRoot.querySelector('.icon');
	const before = getComputedStyle(icon, '::before');

	assert.equal(before.content, JSON.stringify(String.fromCharCode(0xff)));
}
