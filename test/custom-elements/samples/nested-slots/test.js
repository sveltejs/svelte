import * as assert from 'assert';
import './main.svelte';

export default async function (target) {
	target.innerHTML = '<my-app/>';
	const el = target.querySelector('my-app');

	const block = el.shadowRoot.children[0];

	const [slot] = block.children;

	assert.equal(slot.assignedNodes().length, 1);
}