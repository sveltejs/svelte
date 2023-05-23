const thePromise = Promise.resolve(42)

export default {
	props: {
		show: true,
		thePromise
	},

	// if svelte has never seen the promise before then the await block is rendered the first time
	html: `
		<p>loading...</p>
	`,

	test({ assert, component, target }) {
		return thePromise
			.then(() => {
				assert.htmlEqual(target.innerHTML, `
					<p>the value is 42</p>
				`);

				component.show = false;

				assert.htmlEqual(target.innerHTML, `
					<p>Else</p>
				`);

				component.show = true;

				return assert.htmlEqual(target.innerHTML, `
						<p>the value is 42</p>
				`);
			});
	}
};
