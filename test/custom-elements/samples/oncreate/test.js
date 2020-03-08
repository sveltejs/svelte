import * as assert from 'assert';
import './main.svelte';

export default function (target) {
	target.innerHTML = '<my-app attrs="should be set" />';
	const el = target.querySelector('my-app');
	assert.ok(el.wasCreated);
	assert.ok(el.propsSetBeforeMount);
}