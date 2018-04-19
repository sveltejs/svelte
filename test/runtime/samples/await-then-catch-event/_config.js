let fulfil;
let thePromise = new Promise(f => {
	fulfil = f;
});

export default {
	data: {
		thePromise
	},

	html: `
		<p>loading...</p>
	`,

	test(assert, component, target, window) {
		fulfil(42);

		return thePromise
			.then(() => {
				assert.htmlEqual(target.innerHTML, `
					<button>click me</button>
				`);

				const { button } = component.refs;

				const click = new window.MouseEvent('click');
				button.dispatchEvent(click);

				assert.equal(component.get().clicked, 42);

				thePromise = Promise.resolve(43);
				component.set({ thePromise });

				return thePromise;
			})
			.then(() => {
				const { button } = component.refs;

				const click = new window.MouseEvent('click');
				button.dispatchEvent(click);

				assert.equal(component.get().clicked, 43);
			});
	}
};