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
		<br>
		<br>
		<p>the promise is pending</p>
	`,

	async test({ assert, component, target }) {
		fulfil();

		await thePromise;

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>the promise is resolved</p>
			<br>
			<p>the promise is resolved</p>
			<br>
			<p>the promise is resolved</p>
		`
		);

		let reject;

		component.thePromise = thePromise = new Promise((f, r) => {
			reject = r;
		});

		assert.htmlEqual(
			target.innerHTML,
			`
			<br>
			<br>
			<p>the promise is pending</p>
		`
		);

		thePromise.catch(() => {});

		reject(new Error('something broke'));

		try {
			await thePromise;
		} catch {}

		assert.htmlEqual(
			target.innerHTML,
			`<p>oh no! something broke</p>
			<br />
			<br />`
		);
	}
};
