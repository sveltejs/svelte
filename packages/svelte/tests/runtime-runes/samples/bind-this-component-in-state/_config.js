import { test } from '../../test';
import { items } from './data.js';

export default test({
	html: `<p>child</p>`,

	test({ assert, instance }) {
		// the instance is an opaque handle: storing it in $state must not
		// turn it (or anything read through it) into a state proxy
		assert.ok(instance.get_first().myArr === items);
	}
});
