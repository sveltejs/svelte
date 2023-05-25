import * as assert from 'assert.js';
import { tick } from 'svelte';
import './main.svelte';

export default async function (target) {
	target.innerHTML = '<custom-element red white></custom-element>';
	await tick();
	await tick();
	const ceRoot = target.querySelector('custom-element').shadowRoot;
	const div = ceRoot.querySelector('div');
	const p = ceRoot.querySelector('p');

	assert.equal(getComputedStyle(div).color, 'rgb(255, 0, 0)');
	assert.equal(getComputedStyle(p).color, 'rgb(255, 255, 255)');

	const innerRoot = ceRoot.querySelector('my-widget').shadowRoot;
	const innerDiv = innerRoot.querySelector('div');
	const innerP = innerRoot.querySelector('p');

	assert.equal(getComputedStyle(innerDiv).color, 'rgb(255, 0, 0)');
	assert.equal(getComputedStyle(innerP).color, 'rgb(255, 255, 255)');
}
