let fulfil;

const thePromise = new Promise(f => {
	fulfil = f;
});

export default {
	data: {
		show: true,
		thePromise
	},

	html: `
		<p>loading...</p>
	`,

	test(assert, component, target) {
		fulfil(42);

		return thePromise
			.then(() => {
				assert.htmlEqual(target.innerHTML, `
					<p>the value is 42</p>
				`);

				component.set({
					show: false
				});

				assert.htmlEqual(target.innerHTML, `
					<p>Else</p>
				`);

				component.set({
					show: true
				});

				return thePromise.then(() => {
					assert.htmlEqual(target.innerHTML, `
						<p>the value is 42</p>
					`);
				});
			});
	}
};
