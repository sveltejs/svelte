import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	get props() {
		return { foo: [1], bar: [2], clicked: 'neither' };
	},

	html: `
		<button>foo</button>
		<button>bar</button>
		<p>clicked: neither</p>
	`,

	test({ assert, component, target, window }) {
		const buttons = target.querySelectorAll('button');
		const event = new window.MouseEvent('click', { bubbles: true });

		buttons[0].dispatchEvent(event);
		flushSync();

		assert.equal(component.clicked, 'foo');
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>foo</button>
			<button>bar</button>
			<p>clicked: foo</p>
		`
		);

		buttons[1].dispatchEvent(event);
		flushSync();

		assert.equal(component.clicked, 'bar');
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>foo</button>
			<button>bar</button>
			<p>clicked: bar</p>
		`
		);
	}
});
