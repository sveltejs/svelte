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
		<p>loading...</p>
	`,

	async test({ assert, component, target }) {
		fulfil(42);

		await thePromise;
		assert.htmlEqual(target.innerHTML, `<p>the value is 42</p>`);

		let reject;
		thePromise = new Promise((f, r) => {
			reject = r;
		});
		component.thePromise = thePromise;
		assert.htmlEqual(target.innerHTML, `<p>loading...</p>`);

		reject(new Error('something broke'));

		try {
			await thePromise;
		} catch {}

		assert.htmlEqual(target.innerHTML, `<p>oh no! something broke</p>`);
	}
};
