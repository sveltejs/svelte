import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-host-location',
		message: '$host() can only be used inside custom element component instances'
	}
});
