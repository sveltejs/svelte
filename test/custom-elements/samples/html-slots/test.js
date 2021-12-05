import * as assert from 'assert';
import './main.svelte';

export default function (target) {
	target.innerHTML = `
		<custom-element>
			<strong>slotted</strong>
		</custom-element>`;

	const el = target.querySelector('custom-element');

	const div = el.shadowRoot.children[0];
	const [slot0, slot1] = div.children;

	assert.equal(slot0.assignedNodes()[1], target.querySelector('strong'));
	assert.equal(slot1.assignedNodes().length, 0);
}
