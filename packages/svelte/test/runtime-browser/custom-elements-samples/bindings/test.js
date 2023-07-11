import * as assert from 'assert.js';
import { tick } from 'svelte';
import './main.svelte';

export default async function (target) {
	const element = document.createElement('my-app');
	element.prop = true;
	element.toggle();
	target.appendChild(element);
	await tick();
	const el = target.querySelector('my-app');

	await tick();

	assert.ok(!el.prop);
	const p = el.shadowRoot.querySelector('p');
	assert.equal(p.textContent, 'false true');
}
