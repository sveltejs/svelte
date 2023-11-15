import { test } from '../../test';

export default test({
	get props() {
		return {
			items: ['foo', 'bar', 'baz'],
			selected: 'foo'
		};
	},

	html: `
		<button>foo</button>
		<button>bar</button>
		<button>baz</button>
		<p>selected: foo</p>
	`,

	async test({ assert, target, window }) {
		const buttons = target.querySelectorAll('button');
		const event = new window.MouseEvent('click', { bubbles: true });

		await buttons[1].dispatchEvent(event);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>foo</button>
			<button>bar</button>
			<button>baz</button>
			<p>selected: bar</p>
		`
		);
	}
});
