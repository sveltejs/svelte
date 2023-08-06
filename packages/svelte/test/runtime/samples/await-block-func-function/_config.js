export default {
	get props() {
		return {
			thePromise: new Promise((_) => {})
		};
	},

	html: `
		Waiting...
	`,

	async test({ assert, component, target }) {
		await (component.thePromise = Promise.resolve({ func: 12345 }));

		assert.htmlEqual(target.innerHTML, '12345');

		try {
			await (component.thePromise = Promise.reject({ func: 67890 }));
		} catch (e) {
			// do nothing
		}

		assert.htmlEqual(target.innerHTML, '67890');
	}
};
