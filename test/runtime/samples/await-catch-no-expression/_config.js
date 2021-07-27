let fulfil;

let thePromise = new Promise(f => {
	fulfil = f;
});

export default {
	props: {
		thePromise
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

		thePromise = new Promise((f, r) => {
			reject = r;
		});

		component.thePromise = thePromise;

		assert.htmlEqual(target.innerHTML, `
			<br />
			<p>the promise is pending</p>
		`);

		reject(new Error());

		await thePromise.catch(() => {});

		assert.htmlEqual(target.innerHTML, `
			<p>oh no! Something broke!</p>
			<br />
			<p>oh no! Something broke!</p>
		`);
	}
};
