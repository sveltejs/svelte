let fulfil;

const thePromise = new Promise(f => {
	fulfil = f;
});

export default {
	props: {
		show: true,
		thePromise
	},

	html: `
		<p>loading...</p>
	`,

	test({ assert, component, target }) {
		fulfil(42);

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

				return thePromise.then(() => {
					assert.htmlEqual(target.innerHTML, `
						<p>the value is 42</p>
					`);
				});
			});
	}
};
