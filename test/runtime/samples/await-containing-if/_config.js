let fulfil;

let thePromise = new Promise(f => {
	fulfil = f;
});

export default {
	props: {
		thePromise,
		show: true
	},

	html: `
		<div><p>loading...</p></div>
	`,

	test({ assert, component, target }) {
		fulfil(42);

		return thePromise
			.then(() => {
				assert.htmlEqual(target.innerHTML, `
					<div><p>the value is 42</p></div>
				`);

				component.show = false;
				assert.htmlEqual(target.innerHTML, `<div></div>`);

				component.show = true;
				assert.htmlEqual(target.innerHTML, `
					<div><p>the value is 42</p></div>
				`);
			});
	}
};