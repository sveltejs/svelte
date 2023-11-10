import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-catch-placement',
		message: 'Cannot have an {:catch} block outside an {#await ...} block',
		position: [7, 7]
	}
});
