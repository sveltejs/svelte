import * as assert from 'assert';
import { tick } from 'svelte';
import './main.svelte';

export default async function (target) {
	target.innerHTML = '<custom-element></custom-element>';
	await tick();
	const el = target.querySelector('custom-element');

	const events = [];
	el.addEventListener('custom', e => {
		events.push(e.detail);
	});
	el.addEventListener('click', () => {
		events.push('click');
	});

	el.shadowRoot.querySelector('button').click();
	assert.deepEqual(events, ['foo', 'click']);
}
