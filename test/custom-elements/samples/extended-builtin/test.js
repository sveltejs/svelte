import * as assert from 'assert';
import './main.svelte';

export default function (target) {
	target.innerHTML = '<custom-element></custom-element>';
	assert.equal(target.innerHTML, '<custom-element></custom-element>');

	const el = target.querySelector('custom-element');
	const button = el.shadowRoot.querySelector('button');

	assert.ok(button instanceof customElements.get('custom-button'));
}
