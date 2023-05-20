import * as assert from 'assert.js';
import { tick } from 'svelte';
import './main.svelte';

export default async function (target) {
	target.innerHTML = '<p>unstyled</p>';
	target.appendChild(document.createElement('custom-element'));
	await tick();

	const unstyled = target.querySelector('p');
	const styled = target.querySelector('custom-element').shadowRoot.querySelector('p');

	assert.equal(unstyled.textContent, 'unstyled');
	assert.equal(styled.textContent, 'styled');

	assert.equal(getComputedStyle(unstyled).color, 'rgb(0, 0, 0)');
	assert.equal(getComputedStyle(styled).color, 'rgb(255, 0, 0)');
}
