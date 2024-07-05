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
		<p>loading...</p>
	`,

	test({ assert, component, target }) {
		deferred.resolve(42);

		return deferred.promise
			.then(() => {
				assert.htmlEqual(
					target.innerHTML,
					`
					<p>the value is 42</p>
				`
				);
			})
			.finally(() => {
				assert.htmlEqual(
					target.innerHTML,
					`
					<p>the value is 42</p><p>finally</p>
				`
				);
			});
	}
});
