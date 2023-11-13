import { test } from '../../test';

let clicked = false;

export default test({
	get props() {
		return {
			tag: 'div',
			onClick: () => (clicked = true)
		};
	},
	html: '<div style="display: inline;">Foo</div>',

	async test({ assert, target, window }) {
		const div = target.querySelector('div');
		await div?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

		assert.equal(clicked, true);
	}
});
