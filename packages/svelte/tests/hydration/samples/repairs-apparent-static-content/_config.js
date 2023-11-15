import { test } from '../../test';

// This test ensures that expressions that seem static (like {'foo'}) are not statically inlined, because
// they could've been dynamic originally (like {browser ? 'foo' : 'bar'}).
export default test({
	snapshot(target) {
		return {
			h1: target.querySelector('h1')
		};
	}
});
