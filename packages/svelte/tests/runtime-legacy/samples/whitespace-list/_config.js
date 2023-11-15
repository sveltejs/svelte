import { test } from '../../test';

export default test({
	get props() {
		return { one: 'one', two: 'two', three: 'three' };
	},

	html: `
		<ul>
			<li>one</li>
			<li>two</li>
			<li>three</li>
		</ul>
	`,

	test({ assert, target }) {
		const ul = /** @type {HTMLElement} */ (target.querySelector('ul'));

		assert.equal(ul.childNodes.length, 5);
	}
});
