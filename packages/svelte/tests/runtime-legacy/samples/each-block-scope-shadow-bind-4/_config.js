import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: `
		<div>
			b: Hello
			<input />
		</div>
		<button>Button</button>
	`,
	ssrHtml: `
		<div>
			b: Hello
			<input value="Hello" />
		</div>
		<button>Button</button>
	`,
	test({ assert, target, window }) {
		const input = target.querySelector('input');
		ok(input);

		const button = target.querySelector('button');
		ok(button);

		input.value = 'Awesome';
		input.dispatchEvent(new window.Event('input'));
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
				<div>
					b: Awesome
					<input />
				</div>
				<button>Button</button>
      `
		);

		button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
				<div>
					c: World
					<input />
				</div>
				<button>Button</button>
      `
		);

		assert.equal(input.value, 'World');

		input.value = 'Svelte';
		input.dispatchEvent(new window.Event('input'));
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
				<div>
					c: Svelte
					<input />
				</div>
				<button>Button</button>
      `
		);
	}
});
