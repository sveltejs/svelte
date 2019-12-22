import * as assert from 'assert';
import './main.svelte';

console.log('console.log');

export default async function(target) {
	target.innerHTML = '<custom-element></custom-element>';
	const el = target.querySelector('custom-element');
	const label = el.shadowRoot.querySelector('label');
	const input = el.shadowRoot.querySelector('input');

	return new Promise(resolve => {
		el.addEventListener('change', function changeHandler(evt) {
			el.removeEventListener('change', changeHandler);

			assert.equal(evt.target, el);
			assert.equal(input.checked, true);
			resolve();
		});

		label.dispatchEvent(new MouseEvent('click'));
	});
}
