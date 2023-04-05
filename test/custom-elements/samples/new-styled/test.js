import * as assert from 'assert';
import './main.svelte';

export default function (target) {
	target.innerHTML = '<p>unstyled</p>';
	target.appendChild(document.createElement('custom-element'));

	const unstyled = target.querySelector('p');
	const styled = target.querySelector('custom-element').shadowRoot.querySelector('p');

	assert.equal(unstyled.textContent, 'unstyled');
	assert.equal(styled.textContent, 'styled');

	assert.equal(getComputedStyle(unstyled).color, 'rgb(0, 0, 0)');
	assert.equal(getComputedStyle(styled).color, 'rgb(255, 0, 0)');
}
