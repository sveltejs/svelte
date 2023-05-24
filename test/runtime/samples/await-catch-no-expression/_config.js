import { create_deferred } from '../../../helpers.js';

let deferred;

export default {
	before_test() {
		deferred = create_deferred();
	},

	get props() {
		return { thePromise: deferred.promise };
	},

	html: `
		<br />
		<p>the promise is pending</p>
	`,

	async test({ assert, component, target }) {
		deferred.resolve(42);

		await deferred.promise;

		assert.htmlEqual(target.innerHTML, '<br />');

		deferred = create_deferred();
		component.thePromise = deferred.promise;

		assert.htmlEqual(target.innerHTML, '<br /><p>the promise is pending</p>');

		const rejection = deferred.promise
			.catch(() => {})
			.finally(() => {
				assert.htmlEqual(
					target.innerHTML,
					`<p>oh no! Something broke!</p>
					<br />
					<p>oh no! Something broke!</p>`
				);
			});

		deferred.reject(new Error());

		await rejection;
	}
};
