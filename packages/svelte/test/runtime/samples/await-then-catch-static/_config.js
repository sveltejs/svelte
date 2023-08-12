let fulfil;

let promise = new Promise((f) => {
	fulfil = f;
});

export default {
	get props() {
		return { promise };
	},

	html: `
		<p>loading...</p>
	`,

	test({ assert, component, target }) {
		fulfil(42);

		return promise
			.then(() => {
				assert.htmlEqual(
					target.innerHTML,
					`
					<p>loaded</p>
				`
				);

				promise = new Promise((f, _) => {
					fulfil = f;
				});

				component.promise = promise;

				assert.htmlEqual(
					target.innerHTML,
					`
					<p>loading...</p>
				`
				);

				fulfil(43);

				return promise.then(() => {});
			})
			.then(() => {
				assert.htmlEqual(
					target.innerHTML,
					`
					<p>loaded</p>
				`
				);
			});
	}
};
