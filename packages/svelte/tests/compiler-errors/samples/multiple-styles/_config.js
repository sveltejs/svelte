import { test } from '../../test';

export default test({
	error: {
		code: 'duplicate-style-element',
		message: 'A component can have a single top-level <style> element',
		position: [58, 58]
	}
});
