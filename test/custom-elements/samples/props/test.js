import * as assert from 'assert';
import CustomElement from './main.svelte';

export default async function (target) {
	new CustomElement({
		target
	});

	assert.equal(target.innerHTML, '<custom-element></custom-element>');

	const el = target.querySelector('custom-element');

	// await new Promise((resolve) => setTimeout(resolve, 100));
	// await new Promise((resolve) => setTimeout(resolve, 100));
	const widget = el.shadowRoot.querySelector('my-widget');

	console.log(widget);

	// await new Promise((resolve) => setTimeout(resolve, 100));

	const [p1, p2] = widget.shadowRoot.querySelectorAll('p');

	assert.equal(p1.textContent, '3 items');
	assert.equal(p2.textContent, 'a, b, c');

	el.items = ['d', 'e', 'f', 'g', 'h'];

	assert.equal(p1.textContent, '5 items');
	assert.equal(p2.textContent, 'd, e, f, g, h');
}
