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
	async test({ assert, target, window }) {
		const [input1, input2, input3, input4] = target.querySelectorAll('input');
		input1.value = 'Awesome';
		await input1.dispatchEvent(new window.Event('input'));
		await Promise.resolve();

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
		await input2.dispatchEvent(new window.Event('input'));
		await Promise.resolve();

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
		await input3.dispatchEvent(new window.Event('input'));
		await Promise.resolve();

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
		await input4.dispatchEvent(new window.Event('input'));
		await Promise.resolve();

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
