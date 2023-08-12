import * as assert from 'assert.js';
import { tick } from 'svelte';
import './main.svelte';

export default async function (target) {
	target.innerHTML = '<my-app/>';
	await tick();
	const el = target.querySelector('my-app');
	const button = el.shadowRoot.querySelector('button');
	const span = el.shadowRoot.querySelector('span');
	const p = el.shadowRoot.querySelector('p');

	assert.equal(el.counter.count, 0);
	assert.equal(button.innerHTML, 'count: 0');
	assert.equal(span.innerHTML, 'slot 0');
	assert.equal(p.innerHTML, 'Context works');
	assert.equal(getComputedStyle(button).color, 'rgb(255, 0, 0)');

	await button.dispatchEvent(new MouseEvent('click'));

	assert.equal(el.counter.count, 1);
	assert.equal(button.innerHTML, 'count: 1');
	assert.equal(span.innerHTML, 'slot 1');
}
