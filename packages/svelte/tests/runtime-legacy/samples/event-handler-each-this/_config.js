import { test } from '../../test';

export default test({
	get props() {
		return { items: ['foo', 'bar', 'baz'] };
	},

	html: `
		<button>foo</button>
		<button>bar</button>
		<button>baz</button>
	`,

	test({ assert, component, target, window }) {
		const buttons = target.querySelectorAll('button');
		const event = new window.MouseEvent('click');

		/**
		 * @type {any[]}
		 */
		const clicked = [];

		component.$on('clicked', (/** @type {{ detail: { node: any; }; }} */ event) => {
			clicked.push(event.detail.node);
		});

		buttons[1].dispatchEvent(event);

		assert.equal(clicked.length, 1);
		assert.equal(clicked[0].nodeName, 'BUTTON');
		assert.equal(clicked[0].textContent, 'bar');
	}
});
