import * as assert from 'assert';
import './main.svelte';

export default function (target) {
	target.innerHTML = `
		<custom-element><span slot="a">hello world</span><span>bye</span><span>world</span></custom-element>
		<custom-element><span slot="a">hello world</span><span slot="b">hello world</span><span>bye world</span></custom-element>
	`;

	const [a, b] = target.querySelectorAll('custom-element');

	assert.htmlEqual(a.shadowRoot.innerHTML, `
		<slot></slot>
		<slot name="a"></slot>
		<p>$$slots: {"a":true,"default":true}</p>
		<p>Slot b is not available</p>
	`);

	assert.htmlEqual(b.shadowRoot.innerHTML, `
		<slot></slot>
		<slot name="a"></slot>
		<p>$$slots: {"a":true,"b":true,"default":true}</p>
		<div><slot name="b"></slot></div>
	`);

	assert.equal(a.getData(), '');
	assert.equal(b.getData(), 'foo');
}
