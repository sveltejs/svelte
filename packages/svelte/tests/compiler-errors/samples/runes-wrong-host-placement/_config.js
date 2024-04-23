import { test } from '../../test';

export default test({
	error: {
		code: 'invalid_host_location',
		message: '`$host()` can only be used inside custom element component instances'
	}
});
