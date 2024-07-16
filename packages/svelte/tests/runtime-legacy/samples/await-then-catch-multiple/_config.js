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

	test({ assert, component, target }) {
		deferred.resolve(42);

		return deferred.promise
			.then(async () => {
				assert.htmlEqual(
					target.innerHTML,
					`
					<p>the value is 42</p>
					<p>the value is 42</p>
				`
				);

				deferred = create_deferred();

				component.thePromise = deferred.promise;
				await Promise.resolve();

				assert.htmlEqual(
					target.innerHTML,
					`
					<p>loading...</p>
					<p>loading...</p>
				`
				);

				deferred.reject(new Error('something broke'));

				return deferred.promise.catch(() => {});
			})
			.then(() => {
				assert.htmlEqual(
					target.innerHTML,
					`
					<p>oh no! something broke</p>
					<p>oh no! something broke</p>
				`
				);
			});
	}
});
