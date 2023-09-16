let fulfil;

const the_promise = new Promise((f) => {
	fulfil = f;
});

export default {
	get props() {
		return { thePromise: the_promise };
	},

	html: `
		loading...
	`,

	async test({ assert, target }) {
		fulfil([]);

		await the_promise;

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>promise array is empty</p>
		`
		);
	}
};
