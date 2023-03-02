let fulfil;

let promise = new Promise(f => {
	fulfil = f;
});

export default {
	props: {
		promise
	},

	html: `
		<p>loading...</p>
	`,

	test({ assert, component, target }) {
		fulfil(42);

		return promise
		.then(() => {
			assert.htmlEqual(target.innerHTML, `
				<p>loaded</p>
			`);

			let reject;

			promise = new Promise((f, r) => {
				reject = r;
			});

			component.promise = promise;

			assert.htmlEqual(target.innerHTML, `
				<p>loading...</p>
			`);

			reject(new Error('this error should be thrown'));
			return promise;
		})
		.catch((err) => {
			assert.equal(err.message, 'this error should be thrown');
			assert.htmlEqual(target.innerHTML, '');
		});
	}
};
