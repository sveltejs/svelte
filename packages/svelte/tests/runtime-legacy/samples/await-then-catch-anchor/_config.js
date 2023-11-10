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

	html: `
		<div><p>loading...</p></div>
	`,

	test({ assert, component, target }) {
		deferred.resolve(42);

		return deferred.promise
			.then(() => {
				assert.htmlEqual(
					target.innerHTML,
					`
					<div><p>the value is 42</p></div>
				`
				);

				deferred = create_deferred();

				component.thePromise = deferred.promise;

				assert.htmlEqual(target.innerHTML, '<div><p>loading...</p></div>');

				deferred.reject(new Error('something broke'));

				return deferred.promise.catch(() => {});
			})
			.then(() => {
				assert.htmlEqual(target.innerHTML, '<div><p>oh no! something broke</p></div>');
			});
	}
});
