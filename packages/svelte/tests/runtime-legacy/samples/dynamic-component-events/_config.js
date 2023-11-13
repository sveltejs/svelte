import { test } from '../../test';

export default test({
	get props() {
		return { x: true };
	},

	html: `
		<button>select foo</button>
	`,

	test({ assert, component, target, window }) {
		const click = new window.MouseEvent('click', { bubbles: true });

		target.querySelector('button')?.dispatchEvent(click);
		assert.equal(component.selected, 'foo');

		component.x = false;

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>select bar</button>
		`
		);

		target.querySelector('button')?.dispatchEvent(click);
		assert.equal(component.selected, 'bar');
	}
});
