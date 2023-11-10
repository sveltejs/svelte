import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-else-placement',
		message: 'Expected to close {#await} block before seeing {:else} block',
		position: [29, 29]
	}
});
