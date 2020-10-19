import * as assert from 'assert';
import './main.svelte';

export default function (target) {
	target.innerHTML = '<my-app/>';
	const el = target.querySelector('my-app');
	assert.ok(el.wasCreated);
}
