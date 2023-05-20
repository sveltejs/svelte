import * as assert from 'assert.js';
import { tick } from 'svelte';
import './main.svelte';

export default async function (target) {
	target.innerHTML = '<my-app/>';
	await tick();
	const el = target.querySelector('my-app');
	target.removeChild(el);

	await tick();

	assert.ok(target.dataset.onMountDestroyed);
	assert.ok(target.dataset.destroyed);
}
