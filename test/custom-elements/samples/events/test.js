import * as assert from 'assert';
import './main.svelte';

export default function (target) {
	target.innerHTML = '<custom-element></custom-element>';
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
