export default {
	data: {
		items: [
			'whatever'
		],
		foo: 'wrong',
		bar: 'right'
	},

	test(assert, component, target, window) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');

		button.dispatchEvent(event);
		assert.equal(component.get().foo, 'right');

		component.set({ bar: 'left' });
		button.dispatchEvent(event);
		assert.equal(component.get().foo, 'left');
	}
};
