import * as assert from 'assert';
import './main.svelte';

export default async function(target) {
	target.innerHTML = '<custom-element></custom-element>';
	const el = target.querySelector('custom-element');
	const button = el.shadowRoot.querySelector('button');

	return new Promise((resolve, reject) => {
		el.addEventListener('message', function changeHandler(evt) {
			el.removeEventListener('message', changeHandler);

      try {
        assert.equal(evt.target, el);
        assert.equal(evt.detail.text, 'Hello!');
        resolve();
      } catch (err) {
        reject(err);
      }
		});

		button.dispatchEvent(new MouseEvent('click'));
	});
}
