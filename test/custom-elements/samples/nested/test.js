import * as assert from 'assert';
import './main.svelte';

export default async function (target) {
	target.innerHTML = '<my-app/>';
	const el = target.querySelector('my-app');
	const button = el.shadowRoot.querySelector('button');
	const span = el.shadowRoot.querySelector('span');

	assert.equal(el.counter.count, 0);
	assert.equal(button.innerHTML, 'count: 0');
	assert.equal(span.innerHTML, 'slot 0');
	assert.equal(getComputedStyle(button).color, 'rgb(255, 0, 0)');

	await button.dispatchEvent(new MouseEvent('click'));

	assert.equal(el.counter.count, 1);
	assert.equal(button.innerHTML, 'count: 1');
	assert.equal(span.innerHTML, 'slot 1');
}
