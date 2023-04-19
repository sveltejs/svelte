let fulfil;

const thePromise = new Promise(f => {
	fulfil = f;
});

const items = [{
	title: 'a title',
	data: thePromise
}];

export default {
	props: {
		items
	},

	html: `
		<p>a title: loading...</p>
	`,

	test({ assert, target }) {
		fulfil(42);

		return thePromise
			.then(() => {
				assert.htmlEqual(target.innerHTML, `
					<p>a title: 42</p>
				`);
			});
	}
};
