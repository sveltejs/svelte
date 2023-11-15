import { test } from '../../test';

export default test({
	// Even if the {@html } block seems static, it should be preserved as such, because it could be dynamic originally
	// (like {@html browser ? 'foo' : 'bar'} which is then different between client and server.
	// Question is whether that's actually something someone would do in practise, and why, so it's probably better to not
	// slow down hydration just for supporting this edge case - so far we've said no. If someone really needs this we could
	// add something like {@html dynamic ...}
	skip: true
});
