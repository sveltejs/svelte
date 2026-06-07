import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = `<custom-element-no-initial-children></custom-element-no-initial-children>`;
		await tick();

		/** @type {any} */
		const el = target.querySelector('custom-element-no-initial-children');

		assert.htmlEqual(
			el.shadowRoot.innerHTML,
			`<div><slot>Fallback</slot></div>`
		);

		// Now add a child
		const span = document.createElement('span');
		span.textContent = 'Appended Child';
		el.appendChild(span);
		await tick();

		assert.htmlEqual(
			el.shadowRoot.innerHTML,
			`<div><slot>Fallback</slot></div>`
		);
		assert.equal(el.innerHTML, `<span>Appended Child</span>`);
	}
});