import { test } from '../../test';

export default test({
	get props() {
		return {
			thePromise: new Promise((_) => {})
		};
	},

	html: `
		loading...
	`,

	async test({ assert, component, target }) {
		await (component.thePromise = Promise.resolve({ error: 'error message' }));
		assert.htmlEqual(
			target.innerHTML,
			`
				<p>error: error message</p>
				<p>result: </p>
			`
		);

		await (component.thePromise = Promise.resolve({ result: '42' }));

		assert.htmlEqual(
			target.innerHTML,
			`
				<p>error: </p>
				<p>result: 42</p>
			`
		);

		try {
			await (component.thePromise = Promise.reject({
				error: { message: 'oops', code: '123' }
			}));
		} catch (e) {
			// do nothing
		}

		assert.htmlEqual(
			target.innerHTML,
			`
				<p>message: oops</p>
				<p>code: 123</p>
			`
		);

		try {
			await (component.thePromise = Promise.reject({
				error: { message: 'timeout', code: '456' }
			}));
		} catch (e) {
			// do nothing
		}

		assert.htmlEqual(
			target.innerHTML,
			`
				<p>message: timeout</p>
				<p>code: 456</p>
			`
		);
	}
});
