import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>foo</button>
		<button>bar</button>
		<button>baz</button>

		<p>fromDom: </p>
		<p>fromState: </p>
	`,

	test({ assert, component, target, window }) {
		const event = new window.MouseEvent('click');

		const buttons = target.querySelectorAll('button');

		buttons[1].dispatchEvent(event);
		flushSync();

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
