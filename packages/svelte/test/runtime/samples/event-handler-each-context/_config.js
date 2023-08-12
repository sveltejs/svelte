export default {
	get props() {
		return {
			items: ['whatever'],
			foo: 'wrong',
			bar: 'right'
		};
	},

	test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');

		button.dispatchEvent(event);
		assert.equal(component.foo, 'right');

		component.bar = 'left';
		button.dispatchEvent(event);
		assert.equal(component.foo, 'left');
	}
};
