import { test } from '../../test';
import { create_deferred } from '../../../helpers.js';

/** @type {ReturnType<typeof create_deferred>} */
let deferred;

export default test({
	before_test() {
		deferred = create_deferred();
	},

	get props() {
		return { thePromise: deferred.promise, show: true };
	},

	html: `
		<div><p>loading...</p></div>
	`,

	test({ assert, component, target }) {
		deferred.resolve(42);

		return deferred.promise.then(async () => {
			assert.htmlEqual(
				target.innerHTML,
				`
					<div><p>the value is 42</p></div>
				`
			);

			component.show = false;
			assert.htmlEqual(target.innerHTML, '<div></div>');

			component.show = true;
			assert.htmlEqual(
				target.innerHTML,
				`
					<div><p>the value is 42</p></div>
				`
			);
		});
	}
});
