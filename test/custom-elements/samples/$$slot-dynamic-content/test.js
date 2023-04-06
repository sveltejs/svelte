import * as assert from 'assert';
import Component from './main.svelte';

export default function (target) {
	const component = new Component({ target, props: { name: 'slot' } });

	const ce = target.querySelector('my-widget');

	assert.htmlEqual(ce.shadowRoot.innerHTML, `
		<slot>fallback</slot>
		<slot name=\"named\"><p>named fallback</p></slot>
	`);

	component.name = 'slot2';
	assert.htmlEqual(ce.shadowRoot.innerHTML, `
		<slot>fallback</slot>
		<slot name=\"named\"><p>named fallback</p></slot>
	`);
}
