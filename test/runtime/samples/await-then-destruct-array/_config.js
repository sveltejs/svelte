export default {
	get props() {
		return {
			thePromise: new Promise((_) => {})
		};
	},

	html: `
		loading...
	`,

	async test({ assert, component, target }) {
		await (component.thePromise = Promise.resolve([1, 2]));

		assert.htmlEqual(
			target.innerHTML,
			`
				<p>a: 1</p>
				<p>b: 2</p>
			`
		);

		await (component.thePromise = Promise.resolve([4, 5]));

		assert.htmlEqual(
			target.innerHTML,
			`
				<p>a: 4</p>
				<p>b: 5</p>
			`
		);

		try {
			await (component.thePromise = Promise.reject(['a', [6, 7]]));
		} catch (e) {
			// do nothing
		}

		assert.htmlEqual(
			target.innerHTML,
			`
				<p>c: a</p>
				<p>d: 6</p>
				<p>e: 7</p>
			`
		);

		try {
			await (component.thePromise = Promise.reject(['b', [8, 9]]));
		} catch (e) {
			// do nothing
		}

		assert.htmlEqual(
			target.innerHTML,
			`
				<p>c: b</p>
				<p>d: 8</p>
				<p>e: 9</p>
			`
		);
	}
};
