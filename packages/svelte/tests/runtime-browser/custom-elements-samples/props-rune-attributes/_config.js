import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<custom-element foo-bar="1" bar="2" b-az="3"></custom-element>';
		await tick();

		/** @type {any} */
		const el = target.querySelector('custom-element');

		assert.htmlEqual(
			el.shadowRoot.innerHTML,
			`
			<p>1</p>
			<p>2</p>
			<p>3</p>
		`
		);
	}
});
