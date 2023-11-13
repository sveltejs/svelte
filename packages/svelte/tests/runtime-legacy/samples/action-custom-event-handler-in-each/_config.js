import { test } from '../../test';

export default test({
	html: `
		<button>foo</button>
		<button>bar</button>
		<button>baz</button>

		<p>fromDom: </p>
		<p>fromState: </p>
	`,

	async test({ assert, component, target, window }) {
		const event = new window.MouseEvent('click');

		const buttons = target.querySelectorAll('button');

		await buttons[1].dispatchEvent(event);

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>foo</button>
			<button>bar</button>
			<button>baz</button>

			<p>fromDom: bar</p>
			<p>fromState: bar</p>
		`
		);

		assert.equal(component.fromDom, 'bar');
		assert.equal(component.fromState, 'bar');
	}
});
