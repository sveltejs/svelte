import * as assert from 'assert';
import './main.svelte';

export default function (target) {
	target.innerHTML = '<custom-element name="foo"></custom-element>';
	const el = target.querySelector('custom-element');
	assert.deepEqual(el.events, ['foo']);

	el.name = 'bar';
	assert.deepEqual(el.events, ['foo', 'bar']);

	target.innerHTML = '';
	assert.deepEqual(el.events, ['foo', 'bar', 'destroy']);
}
