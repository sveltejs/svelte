let fulfil;

const the_promise = new Promise((f) => {
	fulfil = f;
});

export default {
	get props() {
		return { show: true, thePromise: the_promise };
	},

	html: `
		<p>loading...</p>
	`,

	test({ assert, component, target }) {
		fulfil(42);

		return the_promise.then(() => {
			assert.htmlEqual(
				target.innerHTML,
				`
					<p>the value is 42</p>
				`
			);

			component.show = false;

			assert.htmlEqual(
				target.innerHTML,
				`
					<p>Else</p>
				`
			);

			component.show = true;

			return the_promise.then(() => {
				assert.htmlEqual(
					target.innerHTML,
					`
						<p>the value is 42</p>
					`
				);
			});
		});
	}
};
