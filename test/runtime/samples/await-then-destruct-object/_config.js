export default {
	props: {
		thePromise: new Promise(resolve => {}),
	},

	html: `
		loading...
	`,

	async test({ assert, component, target }) {
		let promise = Promise.resolve({ error: 'error message' });
		component.thePromise = promise;

		await promise;
		assert.htmlEqual(target.innerHTML, `
			<p>error: error message</p>
		`);

		promise = Promise.resolve({ result: '42' });
		component.thePromise = promise;

		await promise;
		assert.htmlEqual(target.innerHTML, `
			<p>result: 42</p>
		`);	
	}
};