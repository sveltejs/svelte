import { test } from '../../test';
import { create_deferred } from '../../../helpers';

/** @type {ReturnType<typeof create_deferred>} */
let deferred;

export default test({
	before_test() {
		deferred = create_deferred();
	},

	get props() {
		return { deferred };
	},

	html: '<div>same text</div>',

	async test({ assert, target }) {
		await deferred.promise;
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>same text text</div>
		`
		);
	}
});
