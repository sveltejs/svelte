import { test } from '../../test';

export default test({
	error: {
		code: 'duplicate-style-element',
		message: 'You can only have one top-level <style> tag per component',
		position: [58, 58]
	}
});
