import { tick } from 'svelte';
import { create_deferred } from '../../../helpers';
import { test } from '../../test';

let fulfilled = create_deferred();
let rejected = create_deferred();
let unhandled = create_deferred();

export default test({
	before_test() {
		fulfilled = create_deferred();
		rejected = create_deferred();
		unhandled = create_deferred();
	},
	get props() {
		return {
			fulfilled: fulfilled.promise,
			rejected: rejected.promise,
			unhandled: unhandled.promise
		};
	},
	async test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			'<p>loading then</p><p>loading catch</p><p>loading rejection</p>'
		);

		fulfilled.resolve();
		rejected.reject(new Error('original rejection'));
		unhandled.reject(new Error('rejection'));
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			'<p>failed: then</p><p>failed: catch</p><p>failed: rejection</p>'
		);
	}
});
