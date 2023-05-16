let fulfil;

let thePromise;

export default {
	get props() {
		thePromise = new Promise((f) => {
			fulfil = f;
		});
		return { thePromise };
	},

	html: `
		<br />
		<p>the promise is pending</p>
	`,

	async test({ assert, component, target }) {
		fulfil(42);

		await thePromise;

		assert.htmlEqual(target.innerHTML, '<br />');

		let reject;

		component.thePromise = thePromise = new Promise((f, r) => {
			reject = r;
		});

		assert.htmlEqual(target.innerHTML, `<br /><p>the promise is pending</p>`);

		const rejection = thePromise
			.catch(() => {})
			.then(() => {
				assert.htmlEqual(
					target.innerHTML,
					`<p>oh no! Something broke!</p>
					<br />
					<p>oh no! Something broke!</p>`
				);
			});

		reject(new Error());

		await rejection;
	}
};
