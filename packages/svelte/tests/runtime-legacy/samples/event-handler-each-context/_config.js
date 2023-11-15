import { ok, test } from '../../test';

export default test({
	get props() {
		return {
			items: ['whatever'],
			foo: 'wrong',
			bar: 'right'
		};
	},

	test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		ok(button);

		const event = new window.MouseEvent('click', { bubbles: true });

		button.dispatchEvent(event);
		assert.equal(component.foo, 'right');

		component.bar = 'left';
		button.dispatchEvent(event);
		assert.equal(component.foo, 'left');
	}
});
