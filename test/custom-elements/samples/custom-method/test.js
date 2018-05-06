import * as assert from 'assert';
import './main.html';

export default function (target) {
	target.innerHTML = '<custom-element name="world"></custom-element>';
	const el = target.querySelector('custom-element');

	el.updateFoo(42);

	const p = el.shadowRoot.querySelector('p');
	assert.equal(p.textContent, '42');
}