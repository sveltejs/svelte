import * as assert from 'assert';
import CustomElement from './main.svelte';

export default function (target) {
	new CustomElement({
		target,
		props: {
			name: 'world'
		}
	});

	assert.equal(target.innerHTML, '<custom-element></custom-element>');

	const el = target.querySelector('custom-element');
	const h1 = el.shadowRoot.querySelector('h1');

	assert.equal(h1.textContent, 'Hello world!');
}
