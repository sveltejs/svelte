import { assert_ok, test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<p>unstyled</p>';
		target.appendChild(document.createElement('custom-element'));
		await tick();
		await tick();

		const unstyled = target.querySelector('p');
		assert_ok(unstyled);
		/** @type {any} */
		const el = target.querySelector('custom-element');
		const styled = el.shadowRoot.querySelector('p');

		assert.equal(unstyled.textContent, 'unstyled');
		assert.equal(styled.textContent, 'styled');

		assert.equal(getComputedStyle(unstyled).color, 'rgb(0, 0, 0)');
		assert.equal(getComputedStyle(styled).color, 'rgb(255, 0, 0)');
	}
});
