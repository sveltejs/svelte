import * as assert from 'assert';
import './main.svelte';

export default function (target) {
	target.innerHTML = '<my-app/>';
	const el = target.querySelector('my-app');	
	target.removeChild(el);

	assert.ok(target.dataset.onMountDestroyed);
	assert.ok(target.dataset.destroyed);
}