import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<div>
			Hello World
			<input />
			<input />
		</div>
		<div>
			Sapper App
			<input />
			<input />
		</div>
	`,

	ssrHtml: `
		<div>
			Hello World
			<input value="Hello"/>
			<input value="World"/>
		</div>
		<div>
			Sapper App
			<input value="Sapper"/>
			<input value="App"/>
		</div>
	`,
	test({ assert, target, window }) {
		const [input1, input2, input3, input4] = target.querySelectorAll('input');
		input1.value = 'Awesome';
		input1.dispatchEvent(new window.Event('input'));
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
				<div>
					Awesome World
					<input />
					<input />
				</div>
				<div>
					Sapper App
					<input />
					<input />
				</div>
      `
		);

		input2.value = 'Svelte';
		input2.dispatchEvent(new window.Event('input'));
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
				<div>
					Awesome Svelte
					<input />
					<input />
				</div>
				<div>
					Sapper App
					<input />
					<input />
				</div>
			`
		);

		input3.value = 'Foo';
		input3.dispatchEvent(new window.Event('input'));
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
				<div>
					Awesome Svelte
					<input />
					<input />
				</div>
				<div>
					Foo App
					<input />
					<input />
				</div>
			`
		);

		input4.value = 'Bar';
		input4.dispatchEvent(new window.Event('input'));
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
				<div>
					Awesome Svelte
					<input />
					<input />
				</div>
				<div>
					Foo Bar
					<input />
					<input />
				</div>
			`
		);
	}
});
