import * as assert from 'assert.js';
import { tick } from 'svelte';
import './main.svelte';

export default async function (target) {
	target.innerHTML = '<my-app prop/>';
	await tick();
	const el = target.querySelector('my-app');

	await tick();

	assert.ok(el.wasCreated);
	assert.ok(el.propsInitialized);
}
