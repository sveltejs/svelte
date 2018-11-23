import * as assert from 'assert';
import './main.html';

export default async function (target) {
	target.innerHTML = '<my-app/>';
	const el = target.querySelector('my-app');
	const counter = el.shadowRoot.querySelector('my-counter');
	const button = counter.shadowRoot.querySelector('button');

	assert.equal(counter.count, 0);
	assert.equal(counter.shadowRoot.innerHTML, `<button>count: 0</button>`);

	await button.dispatchEvent(new MouseEvent('click'));

	assert.equal(counter.count, 1);
	assert.equal(counter.shadowRoot.innerHTML, `<button>count: 1</button>`);
}