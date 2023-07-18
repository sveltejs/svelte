let clicked = false;

export default {
	get props() {
		return {
			tag: 'div',
			onClick: () => (clicked = true)
		};
	},
	html: '<div style="display: inline;">Foo</div>',

	async test({ assert, target, window }) {
		const div = target.querySelector('div');
		await div.dispatchEvent(new window.MouseEvent('click'));

		assert.equal(clicked, true);
	}
};
