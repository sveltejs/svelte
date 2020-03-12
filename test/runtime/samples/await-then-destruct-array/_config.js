export default {
	props: {
		thePromise: new Promise(resolve => {}),
	},

	html: `
		loading...
	`,

	async test({ assert, component, target }) {
		let promise = Promise.resolve([1, 2]);
		component.thePromise = promise;

		await promise;
		assert.htmlEqual(target.innerHTML, `
			<p>a: 1</p>
			<p>b: 2</p>
		`);

		promise = Promise.resolve([4, 5]);
		component.thePromise = promise;

		await promise;
		assert.htmlEqual(target.innerHTML, `
			<p>a: 4</p>
			<p>b: 5</p>
		`);	
	}
};