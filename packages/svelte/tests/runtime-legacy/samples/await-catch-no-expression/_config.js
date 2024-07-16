import { test } from '../../test';
import { create_deferred } from '../../../helpers.js';

/** @type {ReturnType<typeof create_deferred>} */
let deferred;

export default test({
	before_test() {
		deferred = create_deferred();
	},

	get props() {
		return { thePromise: deferred.promise };
	},

	async test({ assert, component, target }) {
		deferred.resolve(42);

		await deferred.promise;

		assert.htmlEqual(target.innerHTML, '<br />');

		deferred = create_deferred();
		component.thePromise = deferred.promise;
		await Promise.resolve();

		assert.htmlEqual(target.innerHTML, '<br /><p>the promise is pending</p>');

		const rejection = deferred.promise
			.catch(() => {})
			.finally(async () => {
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
});
