let fulfil;

const the_promise = new Promise((f) => {
	fulfil = f;
});

export default {
	get props() {
		return { thePromise: the_promise };
	},

	html: `
		<p>loading...</p><p>true!</p>
	`,

	test({ assert, target }) {
		fulfil(42);

		return the_promise.then(() => {
			assert.htmlEqual(
				target.innerHTML,
				`
					<p>the value is 42</p><p>true!</p>
				`
			);
		});
	}
};
