let fulfil;

const thePromise = new Promise((f) => {
	fulfil = f;
});

export default {
	get props() {
		return { thePromise };
	},

	html: `
		<p>loading...</p><p>true!</p>
	`,

	test({ assert, target }) {
		fulfil(42);

		return thePromise.then(() => {
			assert.htmlEqual(
				target.innerHTML,
				`
					<p>the value is 42</p><p>true!</p>
				`
			);
		});
	}
};
