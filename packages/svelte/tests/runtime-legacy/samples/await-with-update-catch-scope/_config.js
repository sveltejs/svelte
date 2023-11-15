import { test } from '../../test';

export default test({
	get props() {
		return {
			thePromise: new Promise((_) => {})
		};
	},

	html: `
		<div>error: </div>
	`,

	async test({ assert, component, target }) {
		await (component.thePromise = Promise.resolve('abc'));

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				error:
				After Resolve:
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
});
