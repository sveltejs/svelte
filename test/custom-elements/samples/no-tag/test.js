import * as assert from 'assert.js';
import { tick } from 'svelte';
import CustomElement from './main.svelte';

export default async function (target) {
	customElements.define('no-tag', CustomElement.element);
	target.innerHTML = '<no-tag name="world"></no-tag>';
	await tick();

	const el = target.querySelector('no-tag');
	const h1 = el.shadowRoot.querySelector('h1');

	assert.equal(h1.textContent, 'Hello world!');
}
