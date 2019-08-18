import * as assert from 'assert';
import CustomElement from './main.svelte';

export default function (target) {
	new CustomElement({
		target
	});

	assert.equal(target.innerHTML, '<custom-element></custom-element>');

	const el = target.querySelector('custom-element');
	const button = el.shadowRoot.querySelector('button');

	assert.ok(button instanceof customElements.get('fancy-button'));
}