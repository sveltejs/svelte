import * as assert from 'assert.js';
import { tick } from 'svelte';
import './main.svelte';

export default async function (target) {
	target.innerHTML = '<custom-element name="foo"></custom-element>';
	await tick();
	const el = target.querySelector('custom-element');
	const events = el.events; // need to get the array reference, else it's gone when destroyed
	assert.deepEqual(events, ['foo']);

	el.name = 'bar';
	await tick();
	assert.deepEqual(events, ['foo', 'bar']);

	target.innerHTML = '';
	await tick();
	assert.deepEqual(events, ['foo', 'bar', 'destroy']);
}
