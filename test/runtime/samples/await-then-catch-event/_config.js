let fulfil;
let thePromise = new Promise(f => {
	fulfil = f;
});

export default {
	props: {
		thePromise
	},

	html: `
		<p>loading...</p>
	`,

	test({ assert, component, target, window }) {
		fulfil(42);

		return thePromise
			.then(async () => {
				assert.htmlEqual(target.innerHTML, `
					<button>click me</button>
				`);

				const { button } = component;

				const click = new window.MouseEvent('click');
				button.dispatchEvent(click);

				assert.equal(component.clicked, 42);

				thePromise = Promise.resolve(43);
				component.thePromise = thePromise;

				return thePromise;
			})
			.then(() => {
				const { button } = component;

				const click = new window.MouseEvent('click');
				button.dispatchEvent(click);

				assert.equal(component.clicked, 43);
			});
	}
};
