export default {
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
	async test({ assert, target, window }) {
		const input = target.querySelector('input');
		const button = target.querySelector('button');

		input.value = 'Awesome';
		await input.dispatchEvent(new window.Event('input'));

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


		await button.dispatchEvent(new window.MouseEvent('click'));

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
		await input.dispatchEvent(new window.Event('input'));

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
};
