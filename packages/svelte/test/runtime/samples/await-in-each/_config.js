let fulfil;

const the_promise = new Promise((f) => {
	fulfil = f;
});

const items = [
	{
		title: 'a title',
		data: the_promise
	}
];

export default {
	get props() {
		return { items };
	},

	html: `
		<p>a title: loading...</p>
	`,

	test({ assert, target }) {
		fulfil(42);

		return the_promise.then(() => {
			assert.htmlEqual(
				target.innerHTML,
				`
					<p>a title: 42</p>
				`
			);
		});
	}
};
