import * as assert from 'assert';
import './main.html';

export default async function (target) {
	target.innerHTML = '<custom-element></custom-element>';
	const el = target.querySelector('custom-element');

	await el.updateFoo(42);

	const p = el.shadowRoot.querySelector('p');
	assert.equal(p.textContent, '42');
}