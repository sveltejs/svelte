import * as assert from 'assert';
import CustomElement from './main.svelte';

export default function (target) {
	new CustomElement({
		target
	});

	assert.equal(target.innerHTML, '<custom-element></custom-element>');

	const el = target.querySelector('custom-element');
	const widget = el.shadowRoot.querySelector('my-widget');

	const [p1, p2, p3, p4] = widget.shadowRoot.querySelectorAll('p');

	assert.equal(p1.textContent, '3 items');
	assert.equal(p2.textContent, 'a, b, c');
	assert.equal(p3.textContent, 'not flagged');
	assert.equal(p4.textContent, 'flagged (static attribute)');

	el.items = ['d', 'e', 'f', 'g', 'h'];
	el.flagged = true;

	assert.equal(p1.textContent, '5 items');
	assert.equal(p2.textContent, 'd, e, f, g, h');
	assert.equal(p3.textContent, 'flagged (dynamic attribute)');
}
