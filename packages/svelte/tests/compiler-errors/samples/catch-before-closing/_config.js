import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-catch-placement',
		message: 'Expected to close {#each} block before seeing {:catch} block',
		position: [41, 41]
	}
});
