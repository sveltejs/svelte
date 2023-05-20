import * as assert from 'assert.js';
import { tick } from 'svelte';
import './main.svelte';

export default async function (target) {
	target.innerHTML = '<custom-element></custom-element>';
	const el = target.querySelector('custom-element');

	const events = [];
	const custom_before = () => {
		events.push('before');
	};
	const click_before = () => {
		events.push('click_before');
	};
	el.addEventListener('custom', custom_before);
	el.addEventListener('click', click_before);

	await tick();

	el.addEventListener('custom', (e) => {
		events.push(e.detail);
	});
	el.addEventListener('click', () => {
		events.push('click');
	});

	el.shadowRoot.querySelector('button').click();
	assert.deepEqual(events, ['before', 'foo', 'click_before', 'click']);

	el.removeEventListener('custom', custom_before);
	el.removeEventListener('click', click_before);
	el.shadowRoot.querySelector('button').click();
	assert.deepEqual(events, ['before', 'foo', 'click_before', 'click', 'foo', 'click']);
}
