import * as assert from 'assert';
import './main.svelte';

export default async function (target) {
	target.innerHTML = '<custom-element></custom-element>';

	// wait one tick in order for styles to be applied
	await Promise.resolve();

	const el = target.querySelector('custom-element');
	const style = el.shadowRoot.querySelector('style');

	assert.ok(style);
	assert.ok(style.sheet);
	assert.equal(style, el.shadowRoot.firstElementChild);
	assert.equal(style.sheet.cssRules.length, 1);
	assert.equal(el.shadowRoot.__svelte_stylesheet, style.sheet);
}
