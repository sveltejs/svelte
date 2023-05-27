export default {
	get props() {
		return {
			thePromise: new Promise((_) => {})
		};
	},

	html: `
		<div>error: undefined</div>
	`,

	async test({ assert, component, target }) {
		await (component.thePromise = Promise.resolve('abc'));

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				error: undefined
				After Resolve: undefined
			</div>
			`
		);

		component.error = 'external error occurred';

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				error: ${component.error}
				After Resolve: ${component.error}
			</div>
			`
		);

		try {
			await (component.thePromise = Promise.reject('failure'));
		} catch (error) {
			// ignore
		}

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				error: ${component.error}
				Rejected: failure
			</div>
			`
		);
	}
};
