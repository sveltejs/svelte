import { ok, test } from '../../test';

export default test({
	get props() {
		return { foo: [1], a: 42 };
	},

	html: `
		<button>click me</button>
	`,

	test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		ok(button);

		const event = new window.MouseEvent('click', { bubbles: true });

		button.dispatchEvent(event);
		assert.equal(component.snapshot, 42);
	}
});
