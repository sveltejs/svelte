import { flushSync, tick } from 'svelte';
import { create_deferred } from '../../../helpers';
import { test } from '../../test';

let deferred = create_deferred();

export default test({
	before_test() {
		deferred = create_deferred();
	},
	get props() {
		return { promise: deferred.promise };
	},
	async test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, '<p>loading</p>');

		// The inner boundary forwards the deferred render error to the outer one.
		deferred.resolve('resolved');
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>failed: then</p><button>reset</button>');

		// Reset creates a new await effect with an already-settled promise.
		flushSync(() => target.querySelector('button')?.click());
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>resolved</p>');
	}
});
